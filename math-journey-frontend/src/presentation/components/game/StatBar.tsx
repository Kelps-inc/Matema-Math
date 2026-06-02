import { cn } from '@/presentation/lib/utils'
import { Star, Zap, Coins } from 'lucide-react'

interface StatBarProps {
  xp: number
  coins: number
  level: number
  levelProgressPercent: number
  className?: string
}

export function StatBar({ xp, coins, level, levelProgressPercent, className }: StatBarProps) {
  return (
    <div className={cn('flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-2xl px-5 py-3 border border-matema-border shadow-sm', className)}>
      <div className="flex items-center gap-1.5">
        <Star className="w-5 h-5 text-yellow-500" strokeWidth={1.75} />
        <div>
          <p className="text-xs text-matema-muted leading-none">Nível</p>
          <p className="text-base font-bold text-matema-dark leading-none">{level}</p>
        </div>
      </div>

      <div className="w-px h-8 bg-matema-border" />

      <div className="flex items-center gap-1.5">
        <Zap className="w-5 h-5 text-yellow-500" strokeWidth={1.75} />
        <div>
          <p className="text-xs text-matema-muted leading-none">XP</p>
          <p className="text-base font-bold text-matema-dark leading-none">{xp.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      <div className="w-px h-8 bg-matema-border" />

      <div className="flex items-center gap-1.5">
        <Coins className="w-5 h-5 text-amber-500" strokeWidth={1.75} />
        <div>
          <p className="text-xs text-matema-muted leading-none">Moedas</p>
          <p className="text-base font-bold text-matema-dark leading-none">{coins}</p>
        </div>
      </div>
    </div>
  )
}
