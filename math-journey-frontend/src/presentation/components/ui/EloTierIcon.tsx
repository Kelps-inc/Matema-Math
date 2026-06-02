import { Award, Shield, Gem, Crown } from 'lucide-react'
import type { EloTier } from '@/domain/user/entities/User'
import { cn } from '@/presentation/lib/utils'

const TIER_CONFIG: Record<EloTier, { icon: React.ElementType; color: string }> = {
  bronze:   { icon: Award,  color: 'text-orange-500' },
  prata:    { icon: Award,  color: 'text-slate-400'  },
  ouro:     { icon: Award,  color: 'text-yellow-500' },
  platina:  { icon: Shield, color: 'text-cyan-500'   },
  diamante: { icon: Gem,    color: 'text-blue-500'   },
  mestre:   { icon: Crown,  color: 'text-purple-600' },
}

interface EloTierIconProps {
  tier: EloTier
  /** Tailwind size class, e.g. "w-8 h-8". Default: "w-8 h-8" */
  size?: string
  className?: string
}

export function EloTierIcon({ tier, size = 'w-8 h-8', className }: EloTierIconProps) {
  const { icon: Icon, color } = TIER_CONFIG[tier] ?? TIER_CONFIG.bronze
  return <Icon className={cn(size, color, className)} strokeWidth={1.75} />
}
