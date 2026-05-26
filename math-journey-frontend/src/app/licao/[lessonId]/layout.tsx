import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseUserRepository } from '@/infrastructure/repositories/SupabaseUserRepository'
import { GameBackground } from '@/presentation/components/game/GameBackground'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LicaoLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/entrar')

  const profile = await new SupabaseUserRepository(supabase).findById(user.id)
  if (!profile) redirect('/entrar')

  return (
    <div className="min-h-screen bg-matema-cream">
      <GameBackground />
      <header className="bg-white/90 backdrop-blur-md border-b border-matema-border sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/modulos"
            className="text-sm text-matema-muted hover:text-matema-dark transition-colors flex items-center gap-1"
          >
            ✕ Sair da lição
          </Link>
          <div className="flex items-center gap-3 text-sm font-semibold">
            <span className="text-matema-primary">⚡ {profile.xp.toLocaleString('pt-BR')} XP</span>
            <span className="text-amber-600">🪙 {profile.coins}</span>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8 relative z-10">
        {children}
      </main>
    </div>
  )
}
