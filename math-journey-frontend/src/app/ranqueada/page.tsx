import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseUserRepository } from '@/infrastructure/repositories/SupabaseUserRepository'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ELO_TIER_LABELS, ELO_TIER_ICONS, type EloTier } from '@/domain/user/entities/User'

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
  const tierIcon = ELO_TIER_ICONS[tier]
  const tierLabel = ELO_TIER_LABELS[tier]
  const divisionLabel = tier === 'mestre' ? '' : ` ${['', 'I', 'II', 'III', 'IV'][division] ?? division}`

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-matema-dark mb-2">Ranqueada</h1>
        <p className="text-matema-muted">Questões estilo ENEM para subir de elo 🔥</p>
      </div>

      {/* Current elo card */}
      <div className={`bg-gradient-to-br ${TIER_COLORS[tier]} border rounded-3xl p-8 mb-8 text-center`}>
        <p className="text-sm font-medium text-matema-muted uppercase tracking-wide mb-2">Seu elo atual</p>
        <div className="text-7xl mb-3">{tierIcon}</div>
        <h2 className="text-3xl font-extrabold text-matema-dark">{tierLabel}{divisionLabel}</h2>
        <p className="text-sm text-matema-muted mt-2">
          Complete partidas ranqueadas para subir de elo!
        </p>
      </div>

      {/* Ranked modes */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <RankedModeCard
          href="/ranqueada/jogar?difficulty=easy"
          icon="🌱"
          label="Fácil"
          description="30 questões acessíveis"
          color="bg-green-50 border-green-200 hover:border-green-400"
          labelColor="text-green-700"
        />
        <RankedModeCard
          href="/ranqueada/jogar?difficulty=medium"
          icon="⚡"
          label="Médio"
          description="20 questões desafiadoras"
          color="bg-amber-50 border-amber-200 hover:border-amber-400"
          labelColor="text-amber-700"
        />
        <RankedModeCard
          href="/ranqueada/jogar?difficulty=hard"
          icon="🔥"
          label="Difícil"
          description="10 questões nível ENEM"
          color="bg-red-50 border-red-200 hover:border-red-400"
          labelColor="text-red-700"
        />
      </div>

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
                <span className="text-2xl">{ELO_TIER_ICONS[t]}</span>
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

function RankedModeCard({
  href,
  icon,
  label,
  description,
  color,
  labelColor,
}: {
  href: string
  icon: string
  label: string
  description: string
  color: string
  labelColor: string
}) {
  return (
    <Link
      href={href}
      className={`block border-2 rounded-3xl p-6 text-center transition-colors ${color}`}
    >
      <div className="text-4xl mb-2">{icon}</div>
      <div className={`font-bold text-lg mb-1 ${labelColor}`}>{label}</div>
      <div className="text-xs text-matema-muted">{description}</div>
    </Link>
  )
}
