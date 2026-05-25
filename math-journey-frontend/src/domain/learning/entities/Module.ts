export class Module {
  constructor(
    readonly id: string,
    readonly slug: string,
    readonly title: string,
    readonly description: string,
    readonly icon: string,
    readonly color: string,
    readonly orderIndex: number,
    readonly isFree: boolean,
    readonly lessons: Lesson[],
  ) {}

  get totalLessons(): number {
    return this.lessons.length
  }
}

export class Lesson {
  constructor(
    readonly id: string,
    readonly moduleId: string,
    readonly slug: string,
    readonly title: string,
    readonly description: string,
    readonly orderIndex: number,
    readonly xpReward: number,
    readonly coinReward: number,
    readonly theory: string | null = null,
  ) {}
}

export class Exercise {
  constructor(
    readonly id: string,
    readonly lessonId: string,
    readonly question: string,
    readonly context: string | null,
    readonly type: 'multiple_choice' | 'true_false' | 'numeric',
    readonly options: string[] | null,
    readonly correctAnswer: string,
    readonly explanation: string,
    readonly difficulty: 'easy' | 'medium' | 'hard',
    readonly orderIndex: number,
  ) {}

  isCorrect(answer: string): boolean {
    return this.correctAnswer.trim().toLowerCase() === answer.trim().toLowerCase()
  }
}
