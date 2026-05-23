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
  console.log('[completeLessonAction] start', { lessonId: input.lessonId, xpReward: input.xpReward, coinReward: input.coinReward, answerCount: input.answers.length })

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError) console.error('[completeLessonAction] auth error:', authError.message)
  if (!user) {
    console.error('[completeLessonAction] no user found')
    return { error: 'Não autenticado' }
  }

  console.log('[completeLessonAction] user:', user.id)

  const parsed = CompleteLessonSchema.safeParse(input)
  if (!parsed.success) {
    console.error('[completeLessonAction] zod validation failed:', parsed.error.flatten())
    return { error: 'Dados inválidos: ' + JSON.stringify(parsed.error.flatten()) }
  }

  const repo = new SupabaseProgressRepository(supabase)
  const useCase = new CompleteLessonUseCase(repo)

  try {
    console.log('[completeLessonAction] executing use case...')
    const result = await useCase.execute({ userId: user.id, ...parsed.data })
    console.log('[completeLessonAction] success:', result)
    revalidatePath('/dashboard')
    revalidatePath('/modulos')
    return { success: true, result }
  } catch (e) {
    console.error('[completeLessonAction] use case threw:', e)
    return { error: e instanceof Error ? e.message : 'Erro ao salvar progresso' }
  }
}
