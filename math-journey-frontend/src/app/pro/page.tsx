import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseUserRepository } from '@/infrastructure/repositories/SupabaseUserRepository'
import { redirect } from 'next/navigation'
import { ProClient } from './ProClient'

export const metadata = { title: 'Matema Pro' }

export default async function ProPage({
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

  // Modo "ver como não-assinante" — só admin (?preview=free).
  const previewFree = profile.isAdmin && preview === 'free'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row } = await (supabase as any)
    .from('user_profiles')
    .select('trial_started_at')
    .eq('id', user.id)
    .single()

  return (
    <ProClient
      hasPro={previewFree ? false : profile.hasProAccess()}
      isAdmin={previewFree ? false : profile.isAdmin}
      subscriptionStatus={previewFree ? 'none' : profile.subscriptionStatus}
      proUntil={previewFree || !profile.proUntil ? null : profile.proUntil.toISOString()}
      trialUsed={previewFree ? false : row?.trial_started_at != null}
      previewFree={previewFree}
    />
  )
}
