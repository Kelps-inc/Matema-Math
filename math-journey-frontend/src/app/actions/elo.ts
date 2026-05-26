'use server'

import { createClient } from '@/infrastructure/supabase/server'
import { revalidatePath } from 'next/cache'
import type { EloTier } from '@/domain/user/entities/User'

export interface PlacementAnswer {
  questionId: string
  answer: string
  isCorrect: boolean
  timeMs: number
}

export interface PlacementResultAnswer {
  questionId: string
  question: string
  topic: string
  difficulty: string
  answer: string
  correctAnswer: string
  explanation: string
  isCorrect: boolean
  timeMs: number
}

export interface PlacementResult {
  score: number
  accuracy: number
  timeBonus: number
  totalTimeMs: number
  correct: number
  total: number
  tier: EloTier
  division: number
  answers: PlacementResultAnswer[]
}

interface EloCalc {
  tier: EloTier
  division: number
  score: number
  accuracy: number
  timeBonus: number
}

function calculateElo(answers: PlacementAnswer[]): EloCalc {
  const correct = answers.filter((a) => a.isCorrect).length
  const accuracy = (correct / answers.length) * 100

  const avgTimeSeconds = answers.reduce((sum, a) => sum + a.timeMs, 0) / answers.length / 1000
  const targetSeconds = 60
  const timeBonus = Math.max(0, Math.min(100, (1 - avgTimeSeconds / targetSeconds) * 100))

  const score = accuracy * 0.85 + timeBonus * 0.15

  let tier: EloTier
  let division: number

  if (score >= 90) {
    tier = 'mestre'; division = 1
  } else if (score >= 75) {
    tier = 'diamante'
    const r = score - 75
    division = r < 3.75 ? 4 : r < 7.5 ? 3 : r < 11.25 ? 2 : 1
  } else if (score >= 60) {
    tier = 'platina'
    const r = score - 60
    division = r < 3.75 ? 4 : r < 7.5 ? 3 : r < 11.25 ? 2 : 1
  } else if (score >= 45) {
    tier = 'ouro'
    const r = score - 45
    division = r < 3.75 ? 4 : r < 7.5 ? 3 : r < 11.25 ? 2 : 1
  } else if (score >= 25) {
    tier = 'prata'
    const r = score - 25
    division = r < 5 ? 4 : r < 10 ? 3 : r < 15 ? 2 : 1
  } else {
    tier = 'bronze'
    const r = score
    division = r < 6.25 ? 4 : r < 12.5 ? 3 : r < 18.75 ? 2 : 1
  }

  return { tier, division, score, accuracy, timeBonus }
}

export async function savePlacementAction(answers: PlacementAnswer[]) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) return { error: 'Não autenticado' }
  if (!answers || answers.length === 0) return { error: 'Respostas inválidas' }

  const elo = calculateElo(answers)

  // Fetch question details to build the full result
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseAny = supabase as any
  const questionIds = answers.map((a) => a.questionId)
  const { data: questions } = await supabaseAny
    .from('placement_questions')
    .select('id, question, correct_answer, explanation, topic, difficulty')
    .in('id', questionIds)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questionMap = new Map((questions ?? []).map((q: any) => [q.id, q]))

  const richAnswers: PlacementResultAnswer[] = answers.map((a) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q = questionMap.get(a.questionId) as any
    return {
      questionId: a.questionId,
      question: q?.question ?? '—',
      topic: q?.topic ?? '—',
      difficulty: q?.difficulty ?? '—',
      answer: a.answer,
      correctAnswer: q?.correct_answer ?? '—',
      explanation: q?.explanation ?? '—',
      isCorrect: a.isCorrect,
      timeMs: a.timeMs,
    }
  })

  const placementResult: PlacementResult = {
    score: Math.round(elo.score),
    accuracy: Math.round(elo.accuracy),
    timeBonus: Math.round(elo.timeBonus),
    totalTimeMs: answers.reduce((s, a) => s + a.timeMs, 0),
    correct: answers.filter((a) => a.isCorrect).length,
    total: answers.length,
    tier: elo.tier,
    division: elo.division,
    answers: richAnswers,
  }

  const { error } = await supabaseAny
    .from('user_profiles')
    .update({
      elo_tier: elo.tier,
      elo_division: elo.division,
      placement_completed: true,
      placement_result: placementResult,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/ranqueada')
  revalidatePath('/dashboard')

  return {
    success: true,
    tier: elo.tier,
    division: elo.division,
    score: Math.round(elo.score),
    accuracy: Math.round(elo.accuracy),
    timeBonus: Math.round(elo.timeBonus),
  }
}
