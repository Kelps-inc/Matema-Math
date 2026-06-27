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
  opts: { skippedExerciseIds?: string[]; earlyExitPenalty?: boolean; useDouble?: boolean } = {},
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

  const skippedIds = opts.skippedExerciseIds ?? []
  const skippedCount = skippedIds.length

  // Busca dificuldade E gabarito de cada questão no servidor — nunca confie no
  // `isCorrect` do cliente (que poderia marcar tudo como certo para inflar LP/XP).
  const DIFF_WEIGHT: Record<string, number> = { easy: 1, medium: 1.5, hard: 2 }
  const diffMap: Record<string, number> = {}
  const correctMap: Record<string, string> = {}
  if (answers.length > 0) {
    const { data: exerciseRows } = await supabaseAny
      .from('exercises')
      .select('id, difficulty, correct_answer')
      .in('id', answers.map((a) => a.exerciseId))
    for (const row of (exerciseRows ?? [])) {
      diffMap[row.id] = DIFF_WEIGHT[row.difficulty] ?? 1
      correctMap[row.id] = row.correct_answer
    }
  }

  // Recalcula isCorrect server-side e descarta IDs de exercício desconhecidos.
  const norm = (v: string) => v.trim().toLowerCase()
  const verified = answers
    .filter((a) => a.exerciseId in correctMap)
    .map((a) => ({ ...a, isCorrect: norm(a.answer) === norm(correctMap[a.exerciseId]) }))
  answers = verified

  let weightedAccuracy = 0
  if (answers.length > 0) {
    const weightedCorrect = answers.filter((a) => a.isCorrect).reduce((s, a) => s + (diffMap[a.exerciseId] ?? 1), 0)
    const weightedTotal   = answers.reduce((s, a) => s + (diffMap[a.exerciseId] ?? 1), 0)
    weightedAccuracy = weightedTotal > 0 ? (weightedCorrect / weightedTotal) * 100 : 0
  }

  const correct   = answers.filter((a) => a.isCorrect).length
  const accuracy  = answers.length > 0 ? (correct / answers.length) * 100 : 0
  // `timeMs` vem do cliente (não há medição confiável no servidor sem round-trip por
  // questão). Como o bônus de velocidade vale só 5% do score, em vez de medir no
  // servidor nós LIMITAMOS o bônus: cada tempo é fixado em [MIN_ANSWER_MS, 60s], de
  // modo que forjar `timeMs` baixíssimo (ou negativo) não infla o bônus além do teto.
  const MIN_ANSWER_MS = 2000 // piso humano plausível para responder uma questão
  const MAX_ANSWER_MS = 60000
  const clampTime = (ms: number) => Math.min(MAX_ANSWER_MS, Math.max(MIN_ANSWER_MS, Number.isFinite(ms) ? ms : MAX_ANSWER_MS))
  const avgTimeMs = answers.length > 0 ? answers.reduce((s, a) => s + clampTime(a.timeMs), 0) / answers.length : MAX_ANSWER_MS
  const timeBonus = Math.max(0, Math.min(100, (1 - avgTimeMs / 1000 / 60) * 100))
  const score     = weightedAccuracy * 0.95 + timeBonus * 0.05

  // Early exit with < 2 answered questions → -2 PDL + -1 per skip
  const change = opts.earlyExitPenalty
    ? -2 - skippedCount
    : lpChangeFromScore(score) - skippedCount

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
  let xpEarned    = correct * xpPerCorrect + accuracyBonus
  let coinsEarned = correct * coinsPerCorrect

  // Power-up Multiplicador 2x: verifica e CONSOME no servidor (anti-spoof).
  let doubled = false
  if (opts.useDouble) {
    const { data: dblItem } = await supabaseAny
      .from('shop_items')
      .select('id')
      .eq('category', 'powerup')
      .eq('name', 'Multiplicador 2x')
      .single()
    if (dblItem?.id) {
      const { data: consumed } = await supabaseAny.rpc('consume_powerup', {
        p_user_id: user.id,
        p_item_id: dblItem.id,
      })
      if (consumed?.success) {
        xpEarned    *= 2
        coinsEarned *= 2
        doubled = true
      }
    }
  }

  // Level formula: xpForLevel(n) = (n-1)² × 50  →  level = floor(√(xp/50)) + 1
  const newXp    = (profile.xp ?? 0) + xpEarned
  const newCoins = (profile.coins ?? 0) + coinsEarned
  const newLevel = Math.floor(Math.sqrt(newXp / 50)) + 1
  const leveledUp = newLevel > (profile.level ?? 1)
  // -----------------------------------------------------------------------

  // Persist answered questions
  const answerRows = answers.map((a) => ({
    user_id:     user.id,
    exercise_id: a.exerciseId,
    answer:      a.answer,
    is_correct:  a.isCorrect,
    time_ms:     a.timeMs,
    is_ranked:   true,
    is_skipped:  false,
    answered_at: new Date().toISOString(),
  }))

  // Persist skipped questions
  const skippedRows = skippedIds.map((id) => ({
    user_id:     user.id,
    exercise_id: id,
    answer:      '',
    is_correct:  false,
    time_ms:     0,
    is_ranked:   true,
    is_skipped:  true,
    answered_at: new Date().toISOString(),
  }))

  await supabaseAny.from('user_exercise_answers').insert([...answerRows, ...skippedRows])

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
    doubled,
  }
}
