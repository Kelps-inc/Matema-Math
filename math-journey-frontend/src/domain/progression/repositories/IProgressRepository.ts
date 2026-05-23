export interface LessonCompletionResult {
  newXp: number
  newLevel: number
  newCoins: number
  leveledUp: boolean
}

export interface IProgressRepository {
  completedLessonIds(userId: string): Promise<string[]>
  completeLesson(
    userId: string,
    lessonId: string,
    xpEarned: number,
    coinsEarned: number,
  ): Promise<LessonCompletionResult>
  recordAnswer(
    userId: string,
    exerciseId: string,
    answer: string,
    isCorrect: boolean,
  ): Promise<void>
}
