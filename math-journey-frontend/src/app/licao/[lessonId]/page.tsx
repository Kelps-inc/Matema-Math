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

  // Converter entidades de domínio para plain objects serializáveis (RSC → Client boundary)
  const lessonDTO: LessonDTO = {
    id: result.lesson.id,
    title: result.lesson.title,
    description: result.lesson.description,
    xpReward: result.lesson.xpReward,
    coinReward: result.lesson.coinReward,
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
        <ExercisePlayer lesson={lessonDTO} exercises={exercisesDTO} />
      )}
    </div>
  )
}
