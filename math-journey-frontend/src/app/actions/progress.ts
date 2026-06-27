'use server'

import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseProgressRepository } from '@/infrastructure/repositories/SupabaseProgressRepository'
import { CompleteLessonUseCase } from '@/application/use-cases/CompleteLessonUseCase'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Os campos xpReward/coinReward/isCorrect enviados pelo cliente são ACEITOS para
// compatibilidade, mas IGNORADOS pelo servidor: a recompensa vem da tabela `lessons`
// e a correção é recalculada contra `exercises.correct_answer`. Nunca confie no cliente.
const CompleteLessonSchema = z.object({
  lessonId: z.string().min(1),
  xpReward: z.number().positive().optional(),
  coinReward: z.number().positive().optional(),
  answers: z.array(z.object({
    exerciseId: z.string().min(1),
    answer: z.string(),
    isCorrect: z.boolean().optional(),
  })),
})

/* eslint-disable @typescript-eslint/no-explicit-any */

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

export async function completeLessonAction(input: {
  lessonId: string
  xpReward?: number
  coinReward?: number
  answers: Array<{ exerciseId: string; answer: string; isCorrect?: boolean }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autenticado' }
  }

  const parsed = CompleteLessonSchema.safeParse(input)
  if (!parsed.success) {
    return { error: 'Dados inválidos.' }
  }

  const { lessonId, answers } = parsed.data
  const supabaseAny = supabase as any

  // A recompensa NÃO é mais lida aqui: o RPC `award_lesson_completion` deriva
  // xp_reward/coin_reward da tabela `lessons` e zera a recompensa ao recompletar
  // uma lição já concluída (anti-refarm). Validamos só a existência da lição para
  // dar um erro amigável antes de chamar o RPC.
  const { data: lessonRow, error: lessonError } = await supabaseAny
    .from('lessons')
    .select('id')
    .eq('id', lessonId)
    .single()

  if (lessonError || !lessonRow) {
    return { error: 'Lição não encontrada.' }
  }

  // Recalcula a correção de cada resposta no servidor contra exercises.correct_answer.
  const exerciseIds = answers.map((a) => a.exerciseId)
  const correctById: Record<string, string> = {}
  if (exerciseIds.length > 0) {
    const { data: exerciseRows } = await supabaseAny
      .from('exercises')
      .select('id, correct_answer, lesson_id')
      .in('id', exerciseIds)
    for (const row of (exerciseRows ?? [])) {
      // Só aceita exercícios que pertencem a esta lição.
      if (row.lesson_id === lessonId) correctById[row.id] = row.correct_answer
    }
  }

  const verifiedAnswers = answers
    .filter((a) => a.exerciseId in correctById)
    .map((a) => ({
      exerciseId: a.exerciseId,
      answer: a.answer,
      isCorrect: normalize(a.answer) === normalize(correctById[a.exerciseId]),
    }))

  const repo = new SupabaseProgressRepository(supabase)
  const useCase = new CompleteLessonUseCase(repo)

  try {
    const result = await useCase.execute({
      userId: user.id,
      lessonId,
      answers: verifiedAnswers,
    })
    revalidatePath('/dashboard')
    revalidatePath('/modulos')
    return { success: true, result }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erro ao salvar progresso' }
  }
}
