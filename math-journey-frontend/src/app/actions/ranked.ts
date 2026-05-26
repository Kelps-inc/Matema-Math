'use server'

import { createClient } from '@/infrastructure/supabase/server'
import { revalidatePath } from 'next/cache'
import type { EloTier } from '@/domain/user/entities/User'

const TIER_ORDER: EloTier[] = ['bronze', 'prata', 'ouro', 'platina', 'diamante', 'mestre']

function advanceElo(
  currentTier: EloTier,
  currentDivision: number,
  divisionsToAdvance: number,
): { tier: EloTier; division: number } {
  let tierIdx = TIER_ORDER.indexOf(currentTier)
  let div = currentDivision

  for (let i = 0; i < divisionsToAdvance; i++) {
    if (TIER_ORDER[tierIdx] === 'mestre') break // cap at Mestre
    div -= 1
    if (div < 1) {
      tierIdx = Math.min(tierIdx + 1, TIER_ORDER.length - 1)
      div = TIER_ORDER[tierIdx] === 'mestre' ? 1 : 4
    }
  }

  return { tier: TIER_ORDER[tierIdx], division: div }
}

export interface RankedAnswer {
  exerciseId: string
  answer: string
  isCorrect: boolean
  timeMs: number
}

export async function saveRankedGameAction(answers: RankedAnswer[]) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Não autenticado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseAny = supabase as any

  const { data: profile } = await supabaseAny
    .from('user_profiles')
    .select('elo_tier, elo_division, placement_completed')
    .eq('id', user.id)
    .single()

  if (!profile?.placement_completed) return { error: 'Complete o teste de classificação primeiro' }

  const correct = answers.filter((a) => a.isCorrect).length
  const accuracy = (correct / answers.length) * 100
  const avgTimeSeconds = answers.reduce((s, a) => s + a.timeMs, 0) / answers.length / 1000
  const timeBonus = Math.max(0, Math.min(100, (1 - avgTimeSeconds / 60) * 100))
  const score = accuracy * 0.85 + timeBonus * 0.15

  // Advance elo based on score (elo never drops)
  let divisionsToAdvance = 0
  if (score >= 90) divisionsToAdvance = 3
  else if (score >= 75) divisionsToAdvance = 2
  else if (score >= 60) divisionsToAdvance = 1
  // below 60: no change (but no drop either)

  const current = {
    tier: (profile.elo_tier ?? 'bronze') as EloTier,
    division: profile.elo_division ?? 4,
  }

  const newElo = divisionsToAdvance > 0
    ? advanceElo(current.tier, current.division, divisionsToAdvance)
    : current

  const advanced = newElo.tier !== current.tier || newElo.division !== current.division

  if (advanced) {
    await supabaseAny
      .from('user_profiles')
      .update({
        elo_tier: newElo.tier,
        elo_division: newElo.division,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
  }

  revalidatePath('/ranqueada')

  return {
    success: true,
    score: Math.round(score),
    accuracy: Math.round(accuracy),
    correct,
    total: answers.length,
    divisionsAdvanced: divisionsToAdvance,
    newTier: newElo.tier,
    newDivision: newElo.division,
    advanced,
  }
}
