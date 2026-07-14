'use client'

import { cn } from '@/presentation/lib/utils'
import { Clock, CheckCircle2, AlertTriangle, Trophy, TrendingDown, Dumbbell, Zap, Coins, GraduationCap } from 'lucide-react'
import type { RankedResult } from './RankedResultScreen'
import type { RankedAnswer } from '@/app/actions/ranked'
import type { RankedExercise } from './RankedPlayer'
import { EloTierIcon } from '@/presentation/components/ui/EloTierIcon'
import { ELO_TIER_LABELS } from '@/domain/user/entities/User'
import { ENEM_FLOOR, ENEM_CEIL, enemScoreLabel } from '@/domain/progression/EnemScore'

const BUDGET_MS = 3 * 60 * 1000  // 3 min por questão

function fmtMs(ms: number): string {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
}

interface Props {
  result: RankedResult
  answers: RankedAnswer[]
  exercises: RankedExercise[]
  onPlayAgain: () => void
  onExit: () => void
}

export function SimuladoReportScreen({ result, answers, exercises, onPlayAgain, onExit }: Props) {
  const tierLabel = ELO_TIER_LABELS[result.newTier]
  const divLabel  = result.newTier === 'mestre' ? '' : ` ${['', 'I', 'II', 'III', 'IV'][result.newDivision] ?? result.newDivision}`
  const lpSign    = result.lpChange >= 0 ? '+' : ''
  const lpColor   = result.lpChange >= 0 ? 'text-green-600' : 'text-red-500'

  const exMap      = new Map(exercises.map(e => [e.id, e]))
  const overBudget = answers.filter(a => a.timeMs > BUDGET_MS)
  const inBudget   = answers.filter(a => a.timeMs <= BUDGET_MS)

  const enemScore = result.enemScore ?? ENEM_FLOOR
  const { label: enemLabel, color: enemColor, bg: enemBg } = enemScoreLabel(enemScore)
  // Bar fill: 338–900 → 0–100%
  const enemBarPct = Math.round(((enemScore - ENEM_FLOOR) / (ENEM_CEIL - ENEM_FLOOR)) * 100)

  return (
    <div className="max-w-xl mx-auto animate-fade-in space-y-3 pb-6">

      {/* ── Resultado Elo ── */}
      <div className="bg-white rounded-3xl border border-matema-border p-5 text-center shadow-sm">
        <div className="mb-1 flex justify-center">
          {result.promoted
            ? <Trophy      className="w-8 h-8 text-matema-primary" strokeWidth={1.75} />
            : result.demoted
            ? <TrendingDown className="w-8 h-8 text-red-500"        strokeWidth={1.75} />
            : <Dumbbell    className="w-8 h-8 text-matema-primary" strokeWidth={1.75} />}
        </div>
        <h2 className="text-lg font-extrabold text-matema-dark mb-0.5">
          {result.promoted ? 'Promovido!' : result.demoted ? 'Rebaixado' : 'Simulado concluído'}
        </h2>
        <div className="flex justify-center mb-2">
          <EloTierIcon tier={result.newTier} size="w-10 h-10" />
        </div>
        <p className="text-lg font-extrabold text-matema-dark mb-1">{tierLabel}{divLabel}</p>
        <p className={cn('text-sm font-bold', lpColor)}>
          {lpSign}{result.lpChange} PDL · {result.newLp} PDL
        </p>
      </div>

      {/* ── Stats rápidos ── */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Acertos',   value: `${result.correct}/${result.total}` },
          { label: 'Precisão',  value: `${result.accuracy}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-matema-border rounded-2xl p-3 text-center">
            <div className="text-base font-extrabold text-matema-dark">{value}</div>
            <div className="text-xs text-matema-muted">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Nota estimada ENEM ── */}
      <div className={cn('rounded-3xl border p-4 shadow-sm', enemBg)}>
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className={cn('w-4 h-4', enemColor)} strokeWidth={1.75} />
          <h3 className={cn('font-extrabold text-sm', enemColor)}>Nota estimada ENEM — Matemática</h3>
        </div>

        <div className="flex items-end justify-between mb-2">
          <span className={cn('text-4xl font-extrabold tabular-nums leading-none', enemColor)}>
            {enemScore}
          </span>
          <span className={cn('text-sm font-bold mb-0.5', enemColor)}>{enemLabel}</span>
        </div>

        {/* Barra 300 → 900 */}
        <div className="relative h-2 bg-white/60 rounded-full overflow-hidden mb-1.5">
          <div
            className={cn('h-full rounded-full transition-all duration-700', enemColor.replace('text-', 'bg-'))}
            style={{ width: `${enemBarPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-current opacity-60">
          <span>338</span>
          <span>média ~520</span>
          <span>900</span>
        </div>

        <p className="mt-2 text-[11px] opacity-70 leading-relaxed">
          Estimativa baseada no percentual de acertos. A nota real do ENEM usa TRI e varia por dificuldade das questões.
        </p>
      </div>

      {/* ── Recompensas ── */}
      <div className="space-y-2">
        {[
          { icon: Zap,   label: 'XP ganho',    value: result.xpEarned,    color: 'text-yellow-500' },
          { icon: Coins, label: 'Matecoins',    value: result.coinsEarned, color: 'text-amber-500'  },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-matema-border">
            <div className="flex items-center gap-2">
              <Icon className={cn('w-5 h-5', color)} strokeWidth={1.75} />
              <span className="font-semibold text-matema-dark text-sm">{label}</span>
            </div>
            <span className={cn('text-lg font-extrabold tabular-nums', color)}>+{value}</span>
          </div>
        ))}
      </div>

      {/* ── Relatório de tempo ── */}
      <div className="bg-white rounded-3xl border border-matema-border p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-matema-primary" strokeWidth={1.75} />
          <h3 className="font-extrabold text-matema-dark text-sm">Relatório de tempo</h3>
          <span className="ml-auto text-xs text-matema-muted">sugerido: 3:00 / questão</span>
        </div>

        {overBudget.length === 0 ? (
          <div className="flex items-center gap-2 py-2 text-green-600 text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} />
            Todas as questões dentro do tempo sugerido!
          </div>
        ) : (
          <div className="space-y-1.5 mb-3">
            <p className="text-xs text-amber-600 font-semibold flex items-center gap-1 mb-2">
              <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.75} />
              {overBudget.length} questão{overBudget.length !== 1 ? 'ões' : ''} acima do tempo sugerido
            </p>
            {overBudget.map((a) => {
              const ex   = exMap.get(a.exerciseId)
              const over = a.timeMs - BUDGET_MS
              const shortQ = ex?.question.replace(/\$[^$]*\$/g, '(...)').slice(0, 80) ?? '—'
              return (
                <div
                  key={a.exerciseId}
                  className="flex items-start gap-3 py-2 px-3 rounded-xl bg-amber-50 border border-amber-100"
                >
                  <span className={cn(
                    'text-xs font-bold mt-0.5 flex-shrink-0',
                    a.isCorrect ? 'text-green-600' : 'text-red-500'
                  )}>
                    {a.isCorrect ? '✓' : '✗'}
                  </span>
                  <p className="text-xs text-matema-dark flex-1 leading-snug line-clamp-2">
                    {shortQ}{shortQ.length >= 80 ? '…' : ''}
                  </p>
                  <div className="flex-shrink-0 text-right">
                    <span className="text-xs font-bold text-amber-600 block">{fmtMs(a.timeMs)}</span>
                    <span className="text-[10px] text-amber-500">+{fmtMs(over)} extra</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-matema-border text-xs text-matema-muted">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" strokeWidth={1.75} />
            {inBudget.length} dentro do tempo
          </span>
          <span className="flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.75} />
            {overBudget.length} acima do tempo
          </span>
        </div>
      </div>

      {/* ── Ações ── */}
      <div className="flex gap-3">
        <button
          onClick={onExit}
          className="flex-1 border-2 border-matema-border text-matema-dark font-bold py-3 rounded-2xl hover:bg-matema-warm transition-colors"
        >
          Sair
        </button>
        <button
          onClick={onPlayAgain}
          className="flex-1 bg-matema-primary text-white font-bold py-3 rounded-2xl hover:opacity-90 transition-opacity"
        >
          Novo simulado
        </button>
      </div>
    </div>
  )
}
