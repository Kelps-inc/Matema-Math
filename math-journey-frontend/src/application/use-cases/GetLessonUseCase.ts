import type { ILearningRepository } from '@/domain/learning/repositories/ILearningRepository'
import type { Lesson, Exercise } from '@/domain/learning/entities/Module'

export interface LessonWithExercises {
  lesson: Lesson
  exercises: Exercise[]
  isCompleted: boolean
}

export class GetLessonUseCase {
  constructor(private readonly learningRepo: ILearningRepository) {}

  async execute(lessonId: string, userId?: string): Promise<LessonWithExercises | null> {
    const [result, completedIds] = await Promise.all([
      this.learningRepo.findLessonWithExercises(lessonId),
      userId ? this.learningRepo.findCompletedLessonIds(userId) : Promise.resolve([]),
    ])

    if (!result) return null

    return {
      ...result,
      isCompleted: completedIds.includes(lessonId),
    }
  }
}
