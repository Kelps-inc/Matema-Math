import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseLearningRepository } from '@/infrastructure/repositories/SupabaseLearningRepository'
import { GetLessonUseCase } from '@/application/use-cases/GetLessonUseCase'
import { ExercisePlayer } from '@/presentation/components/game/ExercisePlayer'
import type { LessonDTO, ExerciseDTO } from '@/presentation/components/game/ExercisePlayer'
import { notFound, redirect } from 'next/navigation'

interface Props {
  params: Promise<{ lessonId: string }>
}

export default async function LicaoPage({ params }: Props) {
  const { lessonId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const useCase = new GetLessonUseCase(new SupabaseLearningRepository(supabase))
  const result = await useCase.execute(lessonId, user.id)

  if (!result) notFound()

  // Busca a próxima lição do mesmo módulo (order_index imediatamente superior)
  const { data: nextLessons } = await supabase
    .from('lessons')
    .select('id, title')
    .eq('module_id', result.lesson.moduleId)
    .gt('order_index', result.lesson.orderIndex)
    .order('order_index')
    .limit(1)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const first = (nextLessons as any[])?.[0]
  const nextLesson: { id: string; title: string } | null = first
    ? { id: first.id as string, title: first.title as string }
    : null

  // Converter entidades de domínio para plain objects serializáveis (RSC → Client boundary)
  const lessonDTO: LessonDTO = {
    id: result.lesson.id,
    title: result.lesson.title,
    description: result.lesson.description,
    xpReward: result.lesson.xpReward,
    coinReward: result.lesson.coinReward,
    theory: result.lesson.theory ?? null,
  }

  const exercisesDTO: ExerciseDTO[] = result.exercises.map((e) => ({
    id: e.id,
    question: e.question,
    context: e.context,
    type: e.type,
    options: e.options,
    correctAnswer: e.correctAnswer,
    explanation: e.explanation,
    difficulty: e.difficulty,
    orderIndex: e.orderIndex,
  }))

  return (
    <div className="animate-fade-in">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-extrabold text-matema-dark mb-1">{result.lesson.title}</h1>
        <p className="text-sm text-matema-muted">{result.lesson.description}</p>
      </div>

      {exercisesDTO.length === 0 ? (
        <div className="text-center py-12 text-matema-muted">
          Nenhum exercício disponível nesta lição ainda.
        </div>
      ) : (
        <ExercisePlayer lesson={lessonDTO} exercises={exercisesDTO} nextLesson={nextLesson} />
      )}
    </div>
  )
}
