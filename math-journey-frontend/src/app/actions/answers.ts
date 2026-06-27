'use server'

import { createClient } from '@/infrastructure/supabase/server'
import { z } from 'zod'

/* eslint-disable @typescript-eslint/no-explicit-any */

// Validação de resposta no servidor. O gabarito (`correct_answer`) NUNCA é
// serializado para o cliente: ele é revelado apenas DEPOIS que o usuário responde,
// junto com o veredito (acertou/errou). Mesma normalização usada nas mutações.
function normalize(value: string): string {
  return value.trim().toLowerCase()
}

const CheckSchema = z.object({
  id: z.string().min(1),
  answer: z.string(),
})

export interface CheckAnswerResult {
  isCorrect: boolean
  correctAnswer: string
}

async function checkAgainst(
  table: 'exercises' | 'placement_questions',
  id: string,
  answer: string,
): Promise<CheckAnswerResult | { error: string }> {
  const parsed = CheckSchema.safeParse({ id, answer })
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data, error } = await (supabase as any)
    .from(table)
    .select('correct_answer')
    .eq('id', parsed.data.id)
    .single()

  if (error || !data) return { error: 'Questão não encontrada.' }

  const correctAnswer = data.correct_answer as string
  return {
    isCorrect: normalize(parsed.data.answer) === normalize(correctAnswer),
    correctAnswer,
  }
}

/** Valida uma resposta de exercício de lição/ranqueada e revela o gabarito. */
export async function checkExerciseAnswerAction(exerciseId: string, answer: string) {
  return checkAgainst('exercises', exerciseId, answer)
}

/** Valida uma resposta do teste de classificação e revela o gabarito. */
export async function checkPlacementAnswerAction(questionId: string, answer: string) {
  return checkAgainst('placement_questions', questionId, answer)
}
