import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseUserRepository } from '@/infrastructure/repositories/SupabaseUserRepository'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ELO_TIER_ICONS, ELO_TIER_LABELS, type EloTier } from '@/domain/user/entities/User'

export default async function RanqueadaModoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const userRepo = new SupabaseUserRepository(supabase)
  const profile = await userRepo.findById(user.id)
  if (!profile) redirect('/entrar')
  if (!profile.placementCompleted) redirect('/ranqueada/placement')

  const tier      = profile.eloTier as EloTier
  const tierIcon  = ELO_TIER_ICONS[tier]
  const tierLabel = ELO_TIER_LABELS[tier]
  const divLabel  = tier === 'mestre' ? '' : ` ${['','I','II','III','IV'][profile.eloDivision] ?? profile.eloDivision}`

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">

      {/* Elo atual — contexto rápido */}
      <div className="flex items-center gap-3 mb-4">
        <Link href="/ranqueada" className="text-sm text-matema-muted hover:text-matema-dark transition-colors">
          ← Ranqueada
        </Link>
        <span className="text-matema-border">|</span>
        <span className="text-sm font-semibold text-matema-dark">
          {tierIcon} {tierLabel}{divLabel} · {profile.eloLp} PDL
        </span>
      </div>

      <h1 className="text-xl font-extrabold text-matema-dark mb-1">Escolha o modo</h1>
      <p className="text-matema-muted text-sm mb-4">
        Cada modo tem seu próprio estilo de questão. O Elo é compartilhado entre todos.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">

        {/* ── Modo Questões Objetivas ── */}
        <div className="bg-white rounded-3xl border-2 border-matema-primary/30 p-4 flex flex-col gap-3 shadow-sm hover:border-matema-primary/60 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-matema-primary/10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
              ⚡
            </div>
            <div>
              <h2 className="font-extrabold text-matema-dark text-sm leading-tight">Questões Objetivas</h2>
              <p className="text-xs text-matema-muted">Modo rápido</p>
            </div>
          </div>

          <p className="text-xs text-matema-muted leading-relaxed">
            10 questões diretas, sem enrolação. Ideal para treinar cálculo, conceitos e fórmulas no menor tempo possível.
          </p>

          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {[
              ['📝', '10 questões'],
              ['⏱️', '~5 minutos'],
              ['🎯', 'Direto ao ponto'],
              ['🏆', 'Conta pro Elo'],
            ].map(([icon, label]) => (
              <div key={label} className="flex items-center gap-1.5 text-matema-muted">
                <span>{icon}</span><span>{label}</span>
              </div>
            ))}
          </div>

          <Link
            href="/ranqueada/jogar/objetivas"
            className="mt-auto w-full text-center bg-matema-primary text-white font-bold py-2.5 rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all text-sm"
          >
            Jogar agora →
          </Link>
        </div>

        {/* ── Modo Estilo ENEM ── */}
        <div className="bg-white rounded-3xl border-2 border-matema-border p-4 flex flex-col gap-3 opacity-70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-matema-accent/10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
              📄
            </div>
            <div>
              <h2 className="font-extrabold text-matema-dark text-sm leading-tight">Estilo ENEM</h2>
              <p className="text-xs text-matema-muted">Em breve</p>
            </div>
          </div>

          <p className="text-xs text-matema-muted leading-relaxed">
            Questões com textões, contexto do mundo real, gráficos e situações-problema — exatamente como caem no ENEM.
          </p>

          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {[
              ['📰', '5–6 questões longas'],
              ['⏱️', '~15 minutos'],
              ['📊', 'Contexto rico'],
              ['🏆', 'Conta pro Elo'],
            ].map(([icon, label]) => (
              <div key={label} className="flex items-center gap-1.5 text-matema-muted">
                <span>{icon}</span><span>{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto w-full text-center bg-matema-border text-matema-muted font-bold py-2.5 rounded-2xl cursor-not-allowed text-sm">
            Em breve...
          </div>
        </div>

      </div>
    </div>
  )
}
