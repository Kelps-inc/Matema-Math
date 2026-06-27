import type { IProgressRepository, LessonCompletionResult } from '@/domain/progression/repositories/IProgressRepository'

export interface CompleteLessonInput {
  userId: string
  lessonId: string
  answers: Array<{ exerciseId: string; answer: string; isCorrect: boolean }>
}

export class CompleteLessonUseCase {
  constructor(private readonly progressRepo: IProgressRepository) {}

  async execute(input: CompleteLessonInput): Promise<LessonCompletionResult> {
    await Promise.all(
      input.answers.map((a) =>
        this.progressRepo.recordAnswer(input.userId, a.exerciseId, a.answer, a.isCorrect)
      )
    )

    return this.progressRepo.completeLesson(input.userId, input.lessonId)
  }
}
