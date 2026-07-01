'use server'

import { createClient } from '@/infrastructure/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  createCustomer,
  createCheckout,
  createSubscription,
  cancelSubscription,
  createPixCharge,
} from '@/infrastructure/payments/abacatepay'
import { PRO_UNIT_PRICE_CENTS } from '@/domain/pro/turmaPricing'

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://matema-math-frontend.vercel.app'
}

/** Ativa o trial de 7 dias (uma vez por usuário) via RPC SECURITY DEFINER. */
export async function startProTrialAction(): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('start_pro_trial')
  if (error) return { error: error.message }
  if (data?.error) return { error: data.error }

  revalidatePath('/ranqueada/jogar')
  revalidatePath('/pro')
  revalidatePath('/dashboard')
  return {}
}

/**
 * Cancela a assinatura recorrente (cartão) no AbacatePay. O acesso Pro é
 * mantido até `pro_until` expirar — só desligamos a renovação. Marca o
 * status como `cancelled` de imediato (o webhook `subscription.cancelled`
 * confirma depois). PIX avulso e turma não têm o que cancelar (não recorrem).
 */
export async function cancelProSubscriptionAction(): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  const { data: profile } = await sb
    .from('user_profiles')
    .select('subscription_status, abacatepay_subscription_id')
    .eq('id', user.id)
    .single()

  if (!profile?.abacatepay_subscription_id || profile.subscription_status !== 'active') {
    return { error: 'Você não tem uma assinatura recorrente ativa para cancelar.' }
  }

  try {
    await cancelSubscription({ subscriptionId: profile.abacatepay_subscription_id })
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Falha ao cancelar a assinatura' }
  }

  await sb.from('user_profiles')
    .update({ subscription_status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', user.id)

  revalidatePath('/configuracoes')
  revalidatePath('/pro')
  revalidatePath('/dashboard')
  return {}
}

/**
 * PIX avulso individual (30 dias) via cobrança de valor customizado — o produto
 * Pro é recorrente e PIX não paga recorrente, então geramos um PIX próprio
 * (R$14,90) com QR. O acesso é liberado pelo webhook (`kind: 'pro_pix'`).
 */
export async function startProPixAction(): Promise<{
  pix?: { brCode: string; brCodeBase64: string; amountCents: number; expiresAt?: string }
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  try {
    const charge = await createPixCharge({
      amountCents: PRO_UNIT_PRICE_CENTS,
      description: 'Matema Pro — 30 dias',
      externalId: user.id,
      userId: user.id,
      kind: 'pro_pix',
    })
    return {
      pix: {
        brCode: charge.brCode,
        brCodeBase64: charge.brCodeBase64,
        amountCents: charge.amount ?? PRO_UNIT_PRICE_CENTS,
        expiresAt: charge.expiresAt,
      },
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Falha ao gerar o PIX' }
  }
}

/** Status Pro do usuário — usado no polling enquanto o PIX não é confirmado. */
export async function getProStatusAction(): Promise<{ active: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { active: false }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('user_profiles')
    .select('pro_until, is_admin')
    .eq('id', user.id)
    .single()
  const active = !!data?.is_admin
    || (!!data?.pro_until && new Date(data.pro_until).getTime() > Date.now())
  return { active }
}

type ProPlan = 'pix' | 'subscription'

/**
 * Inicia o checkout do Pro. Garante o cliente no AbacatePay, cria a cobrança
 * (PIX avulso de 30 dias) ou a assinatura recorrente (cartão) e devolve a URL
 * de pagamento. `externalId`/`metadata.userId` carregam o id do usuário para o
 * webhook mapear de volta. O acesso Pro só é liberado quando o webhook confirma.
 */
export async function startProCheckoutAction(
  plan: ProPlan,
): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const productId = process.env.ABACATEPAY_PRO_PRODUCT_ID
  if (!productId) return { error: 'Produto Pro não configurado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  const { data: profile } = await sb
    .from('user_profiles')
    .select('display_name, abacatepay_customer_id')
    .eq('id', user.id)
    .single()

  // Garante o cliente no AbacatePay (reutiliza se já existir).
  let customerId: string | undefined = profile?.abacatepay_customer_id ?? undefined
  if (!customerId) {
    try {
      const customer = await createCustomer({
        name: profile?.display_name || user.email || 'Aluno Matema',
        email: user.email || '',
      })
      customerId = customer.id
      await sb.from('user_profiles')
        .update({ abacatepay_customer_id: customerId, updated_at: new Date().toISOString() })
        .eq('id', user.id)
    } catch {
      // Segue sem customerId — o AbacatePay coleta os dados no checkout.
      customerId = undefined
    }
  }

  const base = siteUrl()
  const common = {
    productId,
    customerId,
    externalId: user.id,
    userId: user.id,
    returnUrl: `${base}/pro`,
    completionUrl: `${base}/pro/sucesso`,
  }

  try {
    const checkout = plan === 'subscription'
      ? await createSubscription(common)
      : await createCheckout({ ...common, methods: ['PIX', 'CARD'] })
    return { url: checkout.url }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Falha ao iniciar pagamento' }
  }
}
