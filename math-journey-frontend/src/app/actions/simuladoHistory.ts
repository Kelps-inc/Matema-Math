'use server'

import { createClient } from '@/infrastructure/supabase/server'
import type { EloTier } from '@/domain/user/entities/User'

export interface SimuladoAttempt {
  id: string
  score: number
  enemScore: number
  accuracy: number
  correct: number
  total: number
  timeTakenMs: number
  lpChange: number
  newLp: number
  newTier: EloTier
  newDivision: number
  xpEarned: number
  coinsEarned: number
  doubled: boolean
  completedAt: string
}

export async function getSimuladoHistoryAction(): Promise<SimuladoAttempt[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data } = await db
    .from('simulado_attempts')
    .select('id, score, enem_score, accuracy, correct, total, time_taken_ms, lp_change, new_lp, new_tier, new_division, xp_earned, coins_earned, doubled, completed_at')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((r: any) => ({
    id:          r.id,
    score:       r.score,
    enemScore:   r.enem_score,
    accuracy:    r.accuracy,
    correct:     r.correct,
    total:       r.total,
    timeTakenMs: r.time_taken_ms,
    lpChange:    r.lp_change,
    newLp:       r.new_lp,
    newTier:     r.new_tier as EloTier,
    newDivision: r.new_division,
    xpEarned:    r.xp_earned,
    coinsEarned: r.coins_earned,
    doubled:     r.doubled,
    completedAt: r.completed_at,
  }))
}
