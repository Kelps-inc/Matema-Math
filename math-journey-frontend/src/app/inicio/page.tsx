import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseUserRepository } from '@/infrastructure/repositories/SupabaseUserRepository'
import { GameHeader } from '@/presentation/components/game/GameHeader'
import { HomeBackground } from '@/presentation/components/game/HomeBackground'
import { redirect } from 'next/navigation'

export default async function InicioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const userRepo = new SupabaseUserRepository(supabase)
  const profile = await userRepo.findById(user.id)
  if (!profile) redirect('/entrar')

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <GameHeader user={profile} />
      <HomeBackground />
    </div>
  )
}
