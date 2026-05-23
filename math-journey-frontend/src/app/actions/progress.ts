'use server'

import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseProgressRepository } from '@/infrastructure/repositories/SupabaseProgressRepository'
import { CompleteLessonUseCase } from '@/application/use-cases/CompleteLessonUseCase'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CompleteLessonSchema = z.object({
  lessonId: z.string().uuid(),
  xpReward: z.number().positive(),
  coinReward: z.number().positive(),
  answers: z.array(z.object({
    exerciseId: z.string().uuid(),
    answer: z.string(),
    isCorrect: z.boolean(),
  })),
})

export async function completeLessonAction(input: {
  lessonId: string
  xpReward: number
  coinReward: number
  answers: Array<{ exerciseId: string; answer: string; isCorrect: boolean }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autenticado' }

  const parsed = CompleteLessonSchema.safeParse(input)
  if (!parsed.success) return { error: 'Dados inválidos' }

  const repo = new SupabaseProgressRepository(supabase)
  const useCase = new CompleteLessonUseCase(repo)

  try {
    const result = await useCase.execute({ userId: user.id, ...parsed.data })
    revalidatePath('/dashboard')
    revalidatePath('/modulos')
    return { success: true, result }
  } catch (e) {
    return { error: 'Erro ao salvar progresso' }
  }
}
