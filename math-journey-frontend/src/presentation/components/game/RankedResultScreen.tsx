'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/presentation/lib/utils'
import { EloTierIcon } from '@/presentation/components/ui/EloTierIcon'
import { ELO_TIER_LABELS, type EloTier } from '@/domain/user/entities/User'
import { Zap, Coins, PartyPopper, TrendingDown, Dumbbell } from 'lucide-react'

export interface RankedResult {
  score: number; accuracy: number; correct: number; total: number
  lpChange: number; newLp: number; newTier: EloTier; newDivision: number
  promoted: boolean; demoted: boolean
  xpEarned: number; coinsEarned: number; newXp: number; newLevel: number; leveledUp: boolean
  doubled?: boolean
}

interface Props {
  result: RankedResult
  onPlayAgain: () => void
  onExit: () => void
}

function useCountUp(target: number, delay: number, duration = 600) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => {
      const steps = 24
      const stepMs = duration / steps
      let step = 0
      const id = setInterval(() => {
        step++
        setValue(Math.round(target * Math.min(step / steps, 1)))
        if (step >= steps) clearInterval(id)
      }, stepMs)
      return () => clearInterval(id)
    }, delay)
    return () => clearTimeout(t)
  }, [target, delay, duration])
  return value
}

function useAnimatedWidth(percent: number, delay: number) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth(percent), delay)
    return () => clearTimeout(t)
  }, [percent, delay])
  return width
}

function RewardRow({
  icon: Icon, label, value, color, delay,
}: {
  icon: React.ElementType
  label: string
  value: number
  color: string
  delay: number
}) {
  const display = useCountUp(value, delay)
  return (
    <div
      className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-matema-border"
      style={{ animation: `fadeIn 0.4s ease-out ${delay / 1000}s both` }}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn('w-5 h-5', color)} strokeWidth={1.75} />
        <span className="font-semibold text-matema-dark text-sm">{label}</span>
      </div>
      <span className={cn('text-lg font-extrabold tabular-nums', color)}>+{display}</span>
    </div>
  )
}

export function RankedResultScreen({ result, onPlayAgain, onExit }: Props) {
  const tierLabel = ELO_TIER_LABELS[result.newTier]
  const divLabel  = result.newTier === 'mestre' ? '' : ` ${['', 'I', 'II', 'III', 'IV'][result.newDivision] ?? result.newDivision}`
  const lpSign    = result.lpChange >= 0 ? '+' : ''
  const lpColor   = result.lpChange >= 0 ? 'text-green-600' : 'text-red-500'

  // XP progress bar
  const xpFloor   = Math.pow(result.newLevel - 1, 2) * 50
  const xpCeil    = Math.pow(result.newLevel, 2) * 50
  const xpNeeded  = xpCeil - xpFloor
  const xpInLevel = result.newXp - xpFloor
  const xpPercent = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100))
  const xpToNext  = xpCeil - result.newXp
  const lpBarWidth = useAnimatedWidth(result.newLp, 300)
  const xpBarWidth = useAnimatedWidth(xpPercent, 1100)

  return (
    <div className="max-w-xl mx-auto animate-fade-in space-y-3">

      {/* Header card */}
      <div className="bg-white rounded-3xl border border-matema-border p-5 text-center shadow-sm">
        {result.promoted ? (
          <>
            <div className="mb-1 flex justify-center">
              <PartyPopper className="w-8 h-8 text-matema-primary" strokeWidth={1.75} />
            </div>
            <h2 className="text-lg font-extrabold text-matema-dark mb-0.5">Promovido!</h2>
            <p className="text-matema-muted text-xs mb-3">Você subiu de divisão!</p>
          </>
        ) : result.demoted ? (
          <>
            <div className="mb-1 flex justify-center">
              <TrendingDown className="w-8 h-8 text-red-500" strokeWidth={1.75} />
            </div>
            <h2 className="text-lg font-extrabold text-matema-dark mb-0.5">Rebaixado</h2>
            <p className="text-matema-muted text-xs mb-3">Você desceu de divisão.</p>
          </>
        ) : (
          <>
            <div className="mb-1 flex justify-center">
              <Dumbbell className="w-8 h-8 text-matema-primary" strokeWidth={1.75} />
            </div>
            <h2 className="text-lg font-extrabold text-matema-dark mb-0.5">Partida concluída</h2>
            <p className="text-matema-muted text-xs mb-3">Continue jogando para subir!</p>
          </>
        )}

        <div className="mb-1 flex justify-center">
          <EloTierIcon tier={result.newTier} size="w-12 h-12" />
        </div>
        <p className="text-xl font-extrabold text-matema-dark mb-3">{tierLabel}{divLabel}</p>

        {/* LP bar */}
        {result.newTier !== 'mestre' ? (
          <div>
            <div className="flex justify-between text-xs text-matema-muted mb-1">
              <span className={cn('font-bold text-sm', lpColor)}>{lpSign}{result.lpChange} PDL</span>
              <span>{result.newLp} PDL</span>
            </div>
            <div className="h-2 bg-matema-border rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full', result.promoted ? 'bg-green-500' : result.demoted ? 'bg-red-400' : 'bg-matema-primary')}
                style={{ width: `${lpBarWidth}%`, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }}
              />
            </div>
          </div>
        ) : (
          <p className={cn('text-sm font-bold', lpColor)}>{lpSign}{result.lpChange} PDL · {result.newLp} PDL total</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Acertos', value: `${result.correct}/${result.total}` },
          { label: 'Precisão', value: `${result.accuracy}%` },
          { label: 'Pontuação', value: `${result.score}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-matema-border rounded-2xl p-3 text-center">
            <div className="text-lg font-extrabold text-matema-dark">{value}</div>
            <div className="text-xs text-matema-muted">{label}</div>
          </div>
        ))}
      </div>

      {/* Rewards — CoD style, staggered */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-matema-muted px-1 flex items-center gap-2">
          Recompensas
          {result.doubled && (
            <span className="text-[10px] font-extrabold text-matema-accent bg-matema-accent/10 border border-matema-accent/30 px-1.5 py-0.5 rounded-full normal-case tracking-normal">
              ✖️2 em dobro!
            </span>
          )}
        </p>
        <RewardRow icon={Zap}   label="XP"        value={result.xpEarned}    color="text-yellow-500" delay={200} />
        <RewardRow icon={Coins} label="Matecoins"  value={result.coinsEarned} color="text-amber-500"  delay={500} />
      </div>

      {/* XP progress bar */}
      <div
        className="bg-white rounded-2xl border border-matema-border px-4 py-3"
        style={{ animation: 'fadeIn 0.4s ease-out 0.8s both' }}
      >
        <div className="flex justify-between text-xs mb-1.5">
          <span className="font-bold text-matema-dark">Nível {result.newLevel}</span>
          <span className="text-matema-muted">
            {result.leveledUp
              ? <span className="text-matema-primary font-semibold">⬆ Subiu de nível!</span>
              : `${xpToNext} XP para o Nível ${result.newLevel + 1}`}
          </span>
        </div>
        <div className="h-3 bg-matema-warm rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${xpBarWidth}%`,
              background: 'linear-gradient(90deg, #6366f1, #a855f7)',
              transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        </div>
        <p className="text-xs text-matema-muted mt-1 text-right">{xpInLevel} / {xpNeeded} XP</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pb-2">
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
          Jogar de novo
        </button>
      </div>
    </div>
  )
}
