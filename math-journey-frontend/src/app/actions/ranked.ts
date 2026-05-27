'use server'

import { createClient } from '@/infrastructure/supabase/server'
import { revalidatePath } from 'next/cache'
import type { EloTier } from '@/domain/user/entities/User'

const TIER_ORDER: EloTier[] = ['bronze', 'prata', 'ouro', 'platina', 'diamante', 'mestre']

/** LP gained or lost based on score (accuracy 95% + speed 5%) */
function lpChangeFromScore(score: number): number {
  if (score >= 90) return 30
  if (score >= 75) return 20
  if (score >= 60) return 12
  if (score >= 45) return -8
  if (score >= 30) return -18
  return -28
}

/**
 * Applies an LP delta to the current rank.
 * - Overflow (LP ≥ 100): promotes to the next division/tier, carries remainder
 * - Underflow (LP < 0): demotes to the previous division/tier, carries remainder
 * - Floor: Bronze IV at 0 LP — can never fall further
 * - Mestre: no divisions, LP accumulates freely (floor at 0, no demotion)
 */
function applyLpChange(
  tier: EloTier,
  division: number,
  currentLp: number,
  change: number,
): { tier: EloTier; division: number; lp: number } {
  // Mestre has no divisions — LP just grows (floor at 0)
  if (tier === 'mestre') {
    return { tier: 'mestre', division: 1, lp: Math.max(0, currentLp + change) }
  }

  let newLp = currentLp + change
  let tierIdx = TIER_ORDER.indexOf(tier)
  let div = division

  // Promote: advance one division per 100 LP overflow
  while (newLp >= 100) {
    div -= 1
    if (div < 1) {
      tierIdx = Math.min(tierIdx + 1, TIER_ORDER.length - 1)
      div = TIER_ORDER[tierIdx] === 'mestre' ? 1 : 4
    }
    newLp -= 100
    if (TIER_ORDER[tierIdx] === 'mestre') break // reached Mestre
  }

  // Demote: retreat one division per 100 LP underflow
  while (newLp < 0) {
    if (tierIdx === 0 && div >= 4) { // floor at Bronze IV
      newLp = 0
      break
    }
    div += 1
    if (div > 4) {
      tierIdx = Math.max(tierIdx - 1, 0)
      div = 1
    }
    newLp += 100
  }

  return { tier: TIER_ORDER[tierIdx], division: div, lp: newLp }
}

/** Converts a rank position to a comparable integer (higher = better) */
function rankValue(tier: EloTier, division: number): number {
  return TIER_ORDER.indexOf(tier) * 4 + (4 - division)
}

export interface RankedAnswer {
  exerciseId: string
  answer: string
  isCorrect: boolean
  timeMs: number
}

export async function saveRankedGameAction(
  answers: RankedAnswer[],
  opts: { skippedCount?: number; earlyExitPenalty?: boolean } = {},
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Não autenticado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseAny = supabase as any

  const { data: profile } = await supabaseAny
    .from('user_profiles')
    .select('elo_tier, elo_division, elo_lp, placement_completed, xp, coins, level')
    .eq('id', user.id)
    .single()

  if (!profile?.placement_completed) return { error: 'Complete o teste de classificação primeiro' }

  const correct = answers.filter((a) => a.isCorrect).length
  const accuracy  = answers.length > 0 ? (correct / answers.length) * 100 : 0
  const avgTimeMs = answers.length > 0 ? answers.reduce((s, a) => s + a.timeMs, 0) / answers.length : 60000
  const timeBonus = Math.max(0, Math.min(100, (1 - avgTimeMs / 1000 / 60) * 100))
  const score     = accuracy * 0.95 + timeBonus * 0.05

  // Early exit with < 2 answered questions → flat -2 PDL penalty
  const change = opts.earlyExitPenalty
    ? -2
    : lpChangeFromScore(score) - (opts.skippedCount ?? 0)

  const current = {
    tier: (profile.elo_tier ?? 'bronze') as EloTier,
    division: profile.elo_division ?? 4,
    lp: profile.elo_lp ?? 0,
  }

  const newElo = applyLpChange(current.tier, current.division, current.lp, change)

  const promoted = rankValue(newElo.tier, newElo.division) > rankValue(current.tier, current.division)
  const demoted  = rankValue(newElo.tier, newElo.division) < rankValue(current.tier, current.division)
  const changed  = newElo.tier !== current.tier || newElo.division !== current.division || newElo.lp !== current.lp

  // --- XP & coins reward -------------------------------------------------
  // 15 XP + 5 coins per correct answer, plus accuracy bonus
  const xpPerCorrect   = 15
  const coinsPerCorrect = 5
  const accuracyBonus  = accuracy >= 90 ? 50 : accuracy >= 75 ? 25 : accuracy >= 60 ? 10 : 0
  const xpEarned   = correct * xpPerCorrect + accuracyBonus
  const coinsEarned = correct * coinsPerCorrect

  // Level formula: xpForLevel(n) = (n-1)² × 50  →  level = floor(√(xp/50)) + 1
  const newXp    = (profile.xp ?? 0) + xpEarned
  const newCoins = (profile.coins ?? 0) + coinsEarned
  const newLevel = Math.floor(Math.sqrt(newXp / 50)) + 1
  const leveledUp = newLevel > (profile.level ?? 1)
  // -----------------------------------------------------------------------

  // Persist each individual answer so the dashboard can show ranked stats
  const answerRows = answers.map((a) => ({
    user_id:     user.id,
    exercise_id: a.exerciseId,
    answer:      a.answer,
    is_correct:  a.isCorrect,
    time_ms:     a.timeMs,
    is_ranked:   true,
    answered_at: new Date().toISOString(),
  }))
  await supabaseAny.from('user_exercise_answers').insert(answerRows)

  await supabaseAny
    .from('user_profiles')
    .update({
      xp:           newXp,
      coins:        newCoins,
      level:        newLevel,
      ...(changed ? {
        elo_tier:     newElo.tier,
        elo_division: newElo.division,
        elo_lp:       newElo.lp,
      } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  revalidatePath('/ranqueada')
  revalidatePath('/dashboard')

  return {
    success:     true,
    score:       Math.round(score),
    accuracy:    Math.round(accuracy),
    correct,
    total:       answers.length,
    lpChange:    change,
    newLp:       newElo.lp,
    newTier:     newElo.tier,
    newDivision: newElo.division,
    promoted,
    demoted,
    xpEarned,
    coinsEarned,
    newXp,
    newLevel,
    leveledUp,
  }
}
