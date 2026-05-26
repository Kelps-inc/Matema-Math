'use server'

import { createClient } from '@/infrastructure/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { EloTier } from '@/domain/user/entities/User'

export interface PlacementAnswer {
  questionId: string
  answer: string
  isCorrect: boolean
  timeMs: number
}

interface EloResult {
  tier: EloTier
  division: number
  score: number
  accuracy: number
  timeBonus: number
}

function calculateElo(answers: PlacementAnswer[]): EloResult {
  const correct = answers.filter((a) => a.isCorrect).length
  const accuracy = (correct / answers.length) * 100

  // Time bonus: target is 60 s per question. Score 0–100.
  const avgTimeSeconds = answers.reduce((sum, a) => sum + a.timeMs, 0) / answers.length / 1000
  const targetSeconds = 60
  const timeBonus = Math.max(0, Math.min(100, (1 - avgTimeSeconds / targetSeconds) * 100))

  const score = accuracy * 0.85 + timeBonus * 0.15

  let tier: EloTier
  let division: number

  if (score >= 90) {
    tier = 'mestre'
    division = 1
  } else if (score >= 75) {
    tier = 'diamante'
    const range = score - 75 // 0–14.99
    division = range < 3.75 ? 4 : range < 7.5 ? 3 : range < 11.25 ? 2 : 1
  } else if (score >= 60) {
    tier = 'platina'
    const range = score - 60 // 0–14.99
    division = range < 3.75 ? 4 : range < 7.5 ? 3 : range < 11.25 ? 2 : 1
  } else if (score >= 45) {
    tier = 'ouro'
    const range = score - 45 // 0–14.99
    division = range < 3.75 ? 4 : range < 7.5 ? 3 : range < 11.25 ? 2 : 1
  } else if (score >= 25) {
    tier = 'prata'
    const range = score - 25 // 0–19.99
    division = range < 5 ? 4 : range < 10 ? 3 : range < 15 ? 2 : 1
  } else {
    tier = 'bronze'
    const range = score // 0–24.99
    division = range < 6.25 ? 4 : range < 12.5 ? 3 : range < 18.75 ? 2 : 1
  }

  return { tier, division, score, accuracy, timeBonus }
}

export async function savePlacementAction(answers: PlacementAnswer[]) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) return { error: 'Não autenticado' }

  if (!answers || answers.length === 0) return { error: 'Respostas inválidas' }

  const result = calculateElo(answers)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('user_profiles')
    .update({
      elo_tier: result.tier,
      elo_division: result.division,
      placement_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/ranqueada')
  revalidatePath('/dashboard')

  return {
    success: true,
    tier: result.tier,
    division: result.division,
    score: Math.round(result.score),
    accuracy: Math.round(result.accuracy),
    timeBonus: Math.round(result.timeBonus),
  }
}
