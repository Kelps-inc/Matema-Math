export type EloTier = 'bronze' | 'prata' | 'ouro' | 'platina' | 'diamante' | 'mestre'

export const ELO_TIER_LABELS: Record<EloTier, string> = {
  bronze: 'Bronze',
  prata: 'Prata',
  ouro: 'Ouro',
  platina: 'Platina',
  diamante: 'Diamante',
  mestre: 'Mestre',
}

export const ELO_TIER_ICONS: Record<EloTier, string> = {
  bronze: '🥉',
  prata: '🥈',
  ouro: '🥇',
  platina: '💎',
  diamante: '💠',
  mestre: '🔮',
}

export class User {
  constructor(
    readonly id: string,
    readonly email: string,
    readonly username: string,
    readonly displayName: string,
    readonly avatarId: string,
    readonly level: number,
    readonly xp: number,
    readonly coins: number,
    readonly streakDays: number,
    readonly lastActiveAt: Date,
    readonly createdAt: Date,
    readonly isAdmin: boolean = false,
    readonly eloTier: EloTier = 'bronze',
    readonly eloDivision: number = 4,
    readonly placementCompleted: boolean = false,
    readonly eloLp: number = 0,
    readonly placementCompletedAt: Date | null = null,
    readonly proUntil: Date | null = null,
    readonly subscriptionStatus: 'none' | 'trial' | 'active' | 'cancelled' = 'none',
  ) {}

  /** Acesso Pro ativo: admins sempre; demais enquanto `proUntil` for futuro. */
  hasProAccess(now: Date = new Date()): boolean {
    if (this.isAdmin) return true
    return this.proUntil != null && this.proUntil.getTime() > now.getTime()
  }

  xpToNextLevel(): number {
    const nextLevel = this.level + 1
    const xpRequired = Math.pow(nextLevel - 1, 2) * 50
    return Math.max(0, xpRequired - this.xp)
  }

  xpForCurrentLevel(): number {
    return Math.pow(this.level - 1, 2) * 50
  }

  xpForNextLevel(): number {
    return Math.pow(this.level, 2) * 50
  }

  levelProgressPercent(): number {
    const current = this.xp - this.xpForCurrentLevel()
    const needed = this.xpForNextLevel() - this.xpForCurrentLevel()
    return Math.round((current / needed) * 100)
  }
}
