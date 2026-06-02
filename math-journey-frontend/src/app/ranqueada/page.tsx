import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseUserRepository } from '@/infrastructure/repositories/SupabaseUserRepository'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ELO_TIER_LABELS, type EloTier } from '@/domain/user/entities/User'
import { EloTierIcon } from '@/presentation/components/ui/EloTierIcon'
import { Swords } from 'lucide-react'

const TIER_ORDER: EloTier[] = ['bronze', 'prata', 'ouro', 'platina', 'diamante', 'mestre']

const TIER_COLORS: Record<EloTier, string> = {
  bronze:   'from-orange-100 to-amber-50  border-orange-200',
  prata:    'from-slate-100  to-gray-50   border-slate-200',
  ouro:     'from-yellow-100 to-amber-50  border-yellow-200',
  platina:  'from-cyan-100   to-sky-50    border-cyan-200',
  diamante: 'from-blue-100   to-indigo-50 border-blue-200',
  mestre:   'from-purple-100 to-violet-50 border-purple-200',
}

export default async function RanqueadaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const userRepo = new SupabaseUserRepository(supabase)
  const profile = await userRepo.findById(user.id)
  if (!profile) redirect('/entrar')

  // If not placed yet, redirect to placement
  if (!profile.placementCompleted) {
    redirect('/ranqueada/placement')
  }

  const tier = profile.eloTier as EloTier
  const division = profile.eloDivision
  const tierLabel = ELO_TIER_LABELS[tier]
  const divisionLabel = tier === 'mestre' ? '' : ` ${['', 'I', 'II', 'III', 'IV'][division] ?? division}`

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-matema-dark mb-2">Ranqueada</h1>
        <p className="text-matema-muted">Questões estilo ENEM para subir de elo</p>
      </div>

      {/* Current elo card */}
      <div className={`bg-gradient-to-br ${TIER_COLORS[tier]} border rounded-3xl p-8 mb-8 text-center`}>
        <p className="text-sm font-medium text-matema-muted uppercase tracking-wide mb-2">Seu elo atual</p>
        <div className="mb-3 flex justify-center">
          <EloTierIcon tier={tier} size="w-20 h-20" />
        </div>
        <h2 className="text-3xl font-extrabold text-matema-dark">{tierLabel}{divisionLabel}</h2>
        {tier !== 'mestre' ? (
          <div className="mt-4 max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-matema-muted mb-1.5">
              <span className="font-semibold">{profile.eloLp} PDL</span>
              <span>100 PDL</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-matema-primary rounded-full transition-all duration-500"
                style={{ width: `${profile.eloLp}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-matema-muted mt-2 font-semibold">{profile.eloLp} PDL</p>
        )}
        <p className="text-xs text-matema-muted mt-3">
          Complete partidas ranqueadas para subir de elo!
        </p>
      </div>

      {/* Play button */}
      <Link
        href="/ranqueada/jogar"
        className="flex flex-col items-center justify-center w-full bg-matema-primary text-white rounded-3xl py-8 mb-8 hover:opacity-90 active:scale-[0.98] transition-all shadow-md gap-2"
      >
        <span className="flex items-center gap-2 text-2xl font-extrabold">
          <Swords className="w-7 h-7" strokeWidth={1.75} />
          Jogar Ranqueada
        </span>
        <span className="text-sm opacity-80">60 primeiras questões</span>
      </Link>

      {/* Elo ladder */}
      <div className="bg-white rounded-3xl border border-matema-border p-6">
        <h3 className="font-bold text-matema-dark mb-4">Escala de Elos</h3>
        <div className="space-y-2">
          {[...TIER_ORDER].reverse().map((t) => {
            const isCurrentTier = t === tier
            return (
              <div
                key={t}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${
                  isCurrentTier
                    ? 'bg-matema-primary/10 border border-matema-primary/30'
                    : 'bg-matema-cream'
                }`}
              >
                <EloTierIcon tier={t} size="w-6 h-6" />
                <span className={`font-semibold ${isCurrentTier ? 'text-matema-primary' : 'text-matema-dark'}`}>
                  {ELO_TIER_LABELS[t]}
                </span>
                {isCurrentTier && (
                  <span className="ml-auto text-xs font-bold text-matema-primary bg-matema-primary/10 px-2 py-0.5 rounded-full">
                    Você está aqui
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
