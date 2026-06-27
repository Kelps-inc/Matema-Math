'use server'

import { createClient } from '@/infrastructure/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  createCustomer,
  createCheckout,
  createSubscription,
} from '@/infrastructure/payments/abacatepay'

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
