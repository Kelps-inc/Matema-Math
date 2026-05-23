import { cn } from '@/presentation/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'gold' | 'green' | 'purple' | 'easy' | 'medium' | 'hard'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-matema-warm text-matema-dark border border-matema-border',
    gold: 'bg-matema-gold/15 text-amber-700 border border-matema-gold/30',
    green: 'bg-matema-secondary/15 text-green-700 border border-matema-secondary/30',
    purple: 'bg-matema-accent/15 text-purple-700 border border-matema-accent/30',
    easy: 'bg-green-50 text-green-700 border border-green-200',
    medium: 'bg-amber-50 text-amber-700 border border-amber-200',
    hard: 'bg-red-50 text-red-700 border border-red-200',
  }

  return (
    <span
      className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}
      {...props}
    />
  )
}
