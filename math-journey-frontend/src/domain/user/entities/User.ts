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
  ) {}

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
