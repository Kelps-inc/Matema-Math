import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { createServiceClient } from '@/infrastructure/supabase/service'

export const runtime = 'nodejs'

// Compara strings em tempo constante (evita timing attack no secret).
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb)
}

/**
 * Webhook do AbacatePay. Confirma pagamentos e (des)ativa o acesso Pro.
 * Segurança: `webhookSecret` na query (gate principal) + HMAC opcional.
 * Docs: https://docs.abacatepay.com/pages/webhooks/reference
 */
export async function POST(req: NextRequest) {
  const expectedSecret = process.env.ABACATEPAY_WEBHOOK_SECRET
  const gotSecret = req.nextUrl.searchParams.get('webhookSecret') ?? ''
  if (!expectedSecret || !safeEqual(gotSecret, expectedSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const raw = await req.text()

  // Verificação HMAC opcional (defesa extra; o gate é o secret da URL).
  const sig = req.headers.get('x-webhook-signature')
  const hmacKey = process.env.ABACATEPAY_WEBHOOK_SIGNING_KEY
  if (sig && hmacKey) {
    const expected = crypto.createHmac('sha256', hmacKey).update(raw, 'utf8').digest('base64')
    if (!safeEqual(expected, sig)) {
      return NextResponse.json({ error: 'Bad signature' }, { status: 401 })
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any
  try { body = JSON.parse(raw) } catch { return NextResponse.json({ error: 'Bad body' }, { status: 400 }) }

  const event: string = body?.event ?? ''
  const data = body?.data ?? {}
  const kind: string | undefined = data?.metadata?.kind
  const status: string = (data?.status ?? '').toString().toUpperCase()
  const subscriptionId: string | undefined = data?.id

  const sb = createServiceClient()

  // ── Plano Turma: PIX de valor customizado ──────────────────────────────────
  // Quando confirmado, gera os N códigos (idempotente via fulfill_turma_order).
  if (kind === 'turma') {
    const orderId: string | undefined = data?.metadata?.externalId || data?.externalId
    const isPaid =
      status === 'PAID' || event === 'billing.paid' || event === 'pix.paid' ||
      event === 'checkout.completed' || event === 'pixQrCode.paid'
    if (!orderId || !isPaid) return NextResponse.json({ ok: true, ignored: event })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (sb as any).rpc('fulfill_turma_order', {
      p_order_id: orderId,
      p_billing_id: data?.id ?? null,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, kind: 'turma' })
  }

  // ── Plano individual (assinatura/PIX avulso) ───────────────────────────────
  const userId: string | undefined = data?.externalId || data?.metadata?.userId

  // Sempre 200 quando não há o que fazer, para o AbacatePay não reenviar à toa.
  if (!userId) return NextResponse.json({ ok: true, ignored: 'no-user' })

  const now = new Date()
  const addDays = (d: number) => new Date(now.getTime() + d * 864e5).toISOString()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patch: Record<string, any> = { updated_at: now.toISOString() }

  switch (event) {
    case 'checkout.completed':           // PIX/cartão avulso → 30 dias
      patch.pro_until = addDays(30)
      patch.subscription_status = 'active'
      break
    case 'subscription.completed':       // 1ª cobrança da assinatura
    case 'subscription.renewed':         // renovação mensal → +32 dias (carência)
      patch.pro_until = addDays(32)
      patch.subscription_status = 'active'
      if (subscriptionId) patch.abacatepay_subscription_id = subscriptionId
      break
    case 'subscription.cancelled':       // mantém acesso até pro_until expirar
      patch.subscription_status = 'cancelled'
      break
    default:
      return NextResponse.json({ ok: true, ignored: event })
  }

  const { error } = await sb.from('user_profiles').update(patch).eq('id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
