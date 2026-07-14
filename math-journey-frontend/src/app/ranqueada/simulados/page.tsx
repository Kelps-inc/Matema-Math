import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseUserRepository } from '@/infrastructure/repositories/SupabaseUserRepository'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSimuladoHistoryAction } from '@/app/actions/simuladoHistory'
import { EloTierIcon } from '@/presentation/components/ui/EloTierIcon'
import { ELO_TIER_LABELS } from '@/domain/user/entities/User'
import { ClipboardList, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/presentation/lib/utils'
import { enemScoreLabel } from '@/domain/progression/EnemScore'

const DIV_LABELS = ['', 'I', 'II', 'III', 'IV']

function fmtDuration(ms: number): string {
  const totalMin = Math.round(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return h > 0 ? `${h}h${m.toString().padStart(2, '0')}min` : `${m}min`
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default async function SimuladosHistoricoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const userRepo = new SupabaseUserRepository(supabase)
  const profile = await userRepo.findById(user.id)
  if (!profile) redirect('/entrar')
  if (!profile.hasProAccess()) redirect('/pro')

  const attempts = await getSimuladoHistoryAction()

  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((s, a) => s + a.enemScore, 0) / attempts.length)
    : null
  const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.enemScore)) : null
  const worstScore = attempts.length > 0 ? Math.min(...attempts.map((a) => a.enemScore)) : null

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">

      <div className="flex items-center gap-3 mb-4">
        <Link href="/ranqueada/jogar" className="text-sm text-matema-muted hover:text-matema-dark transition-colors">
          ← Escolher modo
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0">
          <ClipboardList className="w-6 h-6 text-amber-600" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-matema-dark leading-tight">Histórico de Simulados</h1>
          <p className="text-sm text-matema-muted">
            {attempts.length} simulado{attempts.length !== 1 ? 's' : ''} realizado{attempts.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {attempts.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white border border-matema-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-extrabold text-matema-dark">{avgScore}</p>
            <p className="text-xs text-matema-muted">Média das notas</p>
          </div>
          <div className="bg-white border border-matema-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-extrabold text-matema-primary">{bestScore}</p>
            <p className="text-xs text-matema-muted">Melhor nota</p>
          </div>
          <div className="bg-white border border-matema-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-extrabold text-red-500">{worstScore}</p>
            <p className="text-xs text-matema-muted">Pior nota</p>
          </div>
        </div>
      )}

      {attempts.length === 0 ? (
        <div className="bg-white border border-matema-border rounded-3xl p-10 text-center">
          <ClipboardList className="w-10 h-10 text-matema-muted mx-auto mb-3" strokeWidth={1.5} />
          <p className="font-semibold text-matema-dark mb-1">Nenhum simulado ainda</p>
          <p className="text-sm text-matema-muted mb-5">Complete seu primeiro Simulado ENEM para começar seu histórico.</p>
          <Link
            href="/ranqueada/jogar/simulado"
            className="inline-block bg-amber-500 text-white font-bold px-6 py-2.5 rounded-2xl hover:bg-amber-600 transition-colors text-sm"
          >
            Iniciar simulado →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {attempts.map((a) => {
            const divLabel = a.newTier === 'mestre' ? '' : ` ${DIV_LABELS[a.newDivision] ?? a.newDivision}`
            const TrendIcon = a.lpChange > 0 ? TrendingUp : a.lpChange < 0 ? TrendingDown : Minus
            const trendColor = a.lpChange > 0 ? 'text-green-600' : a.lpChange < 0 ? 'text-red-500' : 'text-matema-muted'
            const { color: scoreColor, bg: scoreBg } = enemScoreLabel(a.enemScore)

            return (
              <div key={a.id} className="bg-white border border-matema-border rounded-2xl p-4 flex items-center gap-4">
                <div className={cn('w-16 h-16 rounded-2xl border flex flex-col items-center justify-center flex-shrink-0', scoreBg)}>
                  <span className={cn('text-xl font-extrabold leading-none text-center', scoreColor)}>{a.enemScore}</span>
                  <span className={cn('text-[9px] uppercase tracking-wide mt-0.5 text-center', scoreColor)}>nota enem</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-matema-muted mb-1">{fmtDate(a.completedAt)}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="font-semibold text-matema-dark">{a.correct}/{a.total} acertos</span>
                    <span className="text-matema-muted">·</span>
                    <span className="text-matema-muted">{a.accuracy}% de precisão</span>
                    <span className="text-matema-muted">·</span>
                    <span className="flex items-center gap-1 text-matema-muted">
                      <Clock className="w-3 h-3" strokeWidth={2} />
                      {fmtDuration(a.timeTakenMs)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <EloTierIcon tier={a.newTier} size="w-3.5 h-3.5" />
                    <span className="text-xs text-matema-muted">{ELO_TIER_LABELS[a.newTier]}{divLabel}</span>
                    {a.doubled && (
                      <span className="text-[10px] font-extrabold text-matema-accent bg-matema-accent/10 border border-matema-accent/30 px-1.5 py-0.5 rounded-full">
                        ✖️2
                      </span>
                    )}
                  </div>
                </div>

                <div className={cn('flex items-center gap-1 text-sm font-bold flex-shrink-0', trendColor)}>
                  <TrendIcon className="w-4 h-4" strokeWidth={2} />
                  {a.lpChange > 0 ? '+' : ''}{a.lpChange} PDL
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
