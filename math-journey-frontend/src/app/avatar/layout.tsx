import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseUserRepository } from '@/infrastructure/repositories/SupabaseUserRepository'
import { GameHeader } from '@/presentation/components/game/GameHeader'
import { redirect } from 'next/navigation'

export default async function AvatarLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/entrar')

  const profile = await new SupabaseUserRepository(supabase).findById(user.id)
  if (!profile) redirect('/entrar')

  return (
    <div className="min-h-screen bg-matema-cream">
      <GameHeader user={profile} />
      <main className="max-w-5xl mx-auto px-4 py-8 pb-24 sm:pb-8">{children}</main>
    </div>
  )
}
