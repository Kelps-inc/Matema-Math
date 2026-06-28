import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseUserRepository } from '@/infrastructure/repositories/SupabaseUserRepository'
import { redirect } from 'next/navigation'
import { SettingsClient, type SubscriptionInfo } from '@/presentation/components/settings/SettingsClient'

export default async function ConfiguracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>
}) {
  const { preview } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const userRepo = new SupabaseUserRepository(supabase)
  const profile = await userRepo.findById(user.id)
  if (!profile) redirect('/entrar')

  // Modo "ver como não-assinante" — só admin pode ativar (?preview=free).
  const previewFree = profile.isAdmin && preview === 'free'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row } = await (supabase as any)
    .from('user_profiles')
    .select('abacatepay_subscription_id')
    .eq('id', user.id)
    .single()

  const subscription: SubscriptionInfo = previewFree
    ? { isAdmin: false, hasPro: false, status: 'none', proUntil: null, hasActiveSubscription: false }
    : {
        isAdmin: profile.isAdmin,
        hasPro: profile.hasProAccess(),
        status: profile.subscriptionStatus,
        proUntil: profile.proUntil ? profile.proUntil.toISOString() : null,
        hasActiveSubscription:
          profile.subscriptionStatus === 'active' && !!row?.abacatepay_subscription_id,
      }

  return (
    <SettingsClient
      subscription={subscription}
      canPreview={profile.isAdmin}
      previewFree={previewFree}
    />
  )
}
