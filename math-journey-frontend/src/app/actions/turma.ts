'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/infrastructure/supabase/server'
import { createPixCharge } from '@/infrastructure/payments/abacatepay'
import {
  quoteTurma,
  formatBRL,
  TURMA_MIN_SEATS,
  TURMA_MAX_SEATS,
  TURMA_MONTH_OPTIONS,
  type TurmaMonths,
} from '@/domain/pro/turmaPricing'

const OrderSchema = z.object({
  seats: z.coerce.number().int().min(TURMA_MIN_SEATS).max(TURMA_MAX_SEATS),
  months: z.coerce.number().refine(
    (m): m is TurmaMonths => (TURMA_MONTH_OPTIONS as readonly number[]).includes(m),
    'Período inválido',
  ),
})

export interface TurmaCheckout {
  orderId: string
  amountCents: number
  brCode: string
  brCodeBase64: string
  expiresAt?: string
}

/**
 * Cria o pedido da turma e a cobrança PIX de valor customizado.
 * O preço é calculado no servidor (domínio) — o cliente não pode adulterá-lo.
 * O acesso só é liberado quando o webhook confirma o pagamento e gera os códigos.
 */
export async function createTurmaOrderAction(input: {
  seats: number
  months: number
}): Promise<{ checkout?: TurmaCheckout; error?: string }> {
  const parsed = OrderSchema.safeParse(input)
  if (!parsed.success) return { error: 'Dados da turma inválidos' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  let quote
  try {
    quote = quoteTurma(parsed.data.seats, parsed.data.months)
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Cotação inválida' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  // 1) Registra o pedido (status pending) — fonte da verdade do valor/vagas.
  const { data: order, error: orderErr } = await sb
    .from('turma_orders')
    .insert({
      owner_id: user.id,
      seats: quote.seats,
      months: quote.months,
      unit_price_cents: quote.unitPriceCents,
      discount_pct: quote.discountPct,
      total_cents: quote.totalCents,
    })
    .select('id')
    .single()
  if (orderErr || !order) return { error: orderErr?.message || 'Falha ao criar pedido' }

  // 2) Cria a cobrança PIX de valor customizado no AbacatePay.
  try {
    const charge = await createPixCharge({
      amountCents: quote.totalCents,
      description: `Matema Pro Turma — ${quote.seats} alunos · ${quote.months} ${quote.months === 1 ? 'mês' : 'meses'}`,
      externalId: order.id,
      userId: user.id,
      kind: 'turma',
      // Sem `customer`: o AbacatePay exige name+taxId(CPF)+email+cellphone juntos
      // quando enviado, e não coletamos CPF/celular. Ele pede os dados no pagamento.
    })

    if (charge.id) {
      await sb.from('turma_orders')
        .update({ abacatepay_billing_id: charge.id, updated_at: new Date().toISOString() })
        .eq('id', order.id)
    }

    return {
      checkout: {
        orderId: order.id,
        amountCents: quote.totalCents,
        brCode: charge.brCode,
        brCodeBase64: charge.brCodeBase64,
        expiresAt: charge.expiresAt,
      },
    }
  } catch (e) {
    await sb.from('turma_orders')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', order.id)
    return { error: e instanceof Error ? e.message : 'Falha ao gerar o PIX' }
  }
}

export interface TurmaOrderStatus {
  status: 'pending' | 'paid' | 'expired' | 'cancelled'
  seats: number
  months: number
  totalLabel: string
  codes: string[]
}

/**
 * Consulta o status do pedido (polling do nosso DB — a confirmação é gravada
 * pelo webhook). Retorna os códigos quando o pedido está pago.
 */
export async function getTurmaOrderStatusAction(
  orderId: string,
): Promise<{ order?: TurmaOrderStatus; error?: string }> {
  if (!z.string().uuid().safeParse(orderId).success) return { error: 'Pedido inválido' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  const { data: order } = await sb
    .from('turma_orders')
    .select('status, seats, months, total_cents, owner_id')
    .eq('id', orderId)
    .single()
  if (!order || order.owner_id !== user.id) return { error: 'Pedido não encontrado' }

  let codes: string[] = []
  if (order.status === 'paid') {
    const { data: rows } = await sb
      .from('turma_codes')
      .select('code')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })
    codes = (rows ?? []).map((r: { code: string }) => r.code)
  }

  return {
    order: {
      status: order.status,
      seats: order.seats,
      months: order.months,
      totalLabel: formatBRL(order.total_cents),
      codes,
    },
  }
}

/** Resgata um código de turma e libera o Pro para o aluno (via RPC). */
export async function redeemTurmaCodeAction(
  code: string,
): Promise<{ proUntil?: string; error?: string }> {
  const clean = (code ?? '').trim()
  if (clean.length < 4) return { error: 'Código inválido' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('redeem_turma_code', { p_code: clean })
  if (error) return { error: error.message }
  if (data?.error) return { error: data.error }

  revalidatePath('/pro')
  revalidatePath('/dashboard')
  revalidatePath('/ranqueada/jogar')
  return { proUntil: data?.pro_until }
}
