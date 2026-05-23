import { cn } from '@/presentation/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  color?: 'primary' | 'secondary' | 'gold'
  size?: 'sm' | 'md'
  showLabel?: boolean
}

export function ProgressBar({ value, max = 100, className, color = 'primary', size = 'md', showLabel }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100))

  const colors = {
    primary: 'bg-matema-primary',
    secondary: 'bg-matema-secondary',
    gold: 'bg-matema-gold',
  }

  const heights = {
    sm: 'h-2',
    md: 'h-3',
  }

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-matema-warm rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', colors[color])}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-matema-muted mt-1 text-right">{value} / {max}</p>
      )}
    </div>
  )
}
