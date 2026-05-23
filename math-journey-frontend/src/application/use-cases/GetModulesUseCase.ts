import type { ILearningRepository } from '@/domain/learning/repositories/ILearningRepository'
import type { Module } from '@/domain/learning/entities/Module'

export interface ModuleWithProgress {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  color: string
  orderIndex: number
  isFree: boolean
  lessons: Array<{
    id: string
    title: string
    description: string
    orderIndex: number
    xpReward: number
    coinReward: number
    completed: boolean
  }>
  completedCount: number
  totalCount: number
  progressPercent: number
}

export class GetModulesUseCase {
  constructor(private readonly learningRepo: ILearningRepository) {}

  async execute(userId?: string): Promise<ModuleWithProgress[]> {
    const [modules, completedIds] = await Promise.all([
      this.learningRepo.findAllModules(),
      userId ? this.learningRepo.findCompletedLessonIds(userId) : Promise.resolve([]),
    ])

    const completedSet = new Set(completedIds)

    return modules.map((module) => {
      const lessonsWithProgress = module.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        orderIndex: lesson.orderIndex,
        xpReward: lesson.xpReward,
        coinReward: lesson.coinReward,
        completed: completedSet.has(lesson.id),
      }))

      const completedCount = lessonsWithProgress.filter((l) => l.completed).length

      return {
        id: module.id,
        slug: module.slug,
        title: module.title,
        description: module.description,
        icon: module.icon,
        color: module.color,
        orderIndex: module.orderIndex,
        isFree: module.isFree,
        lessons: lessonsWithProgress,
        completedCount,
        totalCount: module.totalLessons,
        progressPercent: module.totalLessons > 0
          ? Math.round((completedCount / module.totalLessons) * 100)
          : 0,
      }
    })
  }
}
