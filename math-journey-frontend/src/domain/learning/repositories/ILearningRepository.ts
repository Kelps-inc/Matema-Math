import type { Module, Lesson, Exercise } from '../entities/Module'

export interface ILearningRepository {
  findAllModules(): Promise<Module[]>
  findModuleBySlug(slug: string): Promise<Module | null>
  findLessonWithExercises(lessonId: string): Promise<{ lesson: Lesson; exercises: Exercise[] } | null>
  findCompletedLessonIds(userId: string): Promise<string[]>
}
