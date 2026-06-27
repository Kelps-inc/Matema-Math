import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseUserRepository } from '@/infrastructure/repositories/SupabaseUserRepository'
import { redirect } from 'next/navigation'
import { ProClient } from './ProClient'

export const metadata = { title: 'Matema Pro' }

export default async function ProPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const userRepo = new SupabaseUserRepository(supabase)
  const profile = await userRepo.findById(user.id)
  if (!profile) redirect('/entrar')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row } = await (supabase as any)
    .from('user_profiles')
    .select('trial_started_at')
    .eq('id', user.id)
    .single()

  return (
    <ProClient
      hasPro={profile.hasProAccess()}
      isAdmin={profile.isAdmin}
      subscriptionStatus={profile.subscriptionStatus}
      proUntil={profile.proUntil ? profile.proUntil.toISOString() : null}
      trialUsed={row?.trial_started_at != null}
    />
  )
}
