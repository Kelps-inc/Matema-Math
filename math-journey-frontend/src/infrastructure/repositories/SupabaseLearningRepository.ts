import type { SupabaseClient } from '@supabase/supabase-js'
import type { ILearningRepository } from '@/domain/learning/repositories/ILearningRepository'
import { Module, Lesson, Exercise } from '@/domain/learning/entities/Module'

/* eslint-disable @typescript-eslint/no-explicit-any */

export class SupabaseLearningRepository implements ILearningRepository {
  constructor(private readonly supabase: SupabaseClient<any>) {}

  async findAllModules(): Promise<Module[]> {
    const { data: modules, error } = await this.supabase
      .from('modules')
      .select('*, lessons(id, module_id, slug, title, description, order_index, xp_reward, coin_reward)')
      .eq('is_ranked', false)
      .order('order_index')

    if (error) throw new Error(error.message)
    if (!modules) return []

    return (modules as any[]).map((m) =>
      new Module(
        m.id,
        m.slug,
        m.title,
        m.description,
        m.icon,
        m.color,
        m.order_index,
        m.is_free,
        ((m.lessons ?? []) as any[])
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((l: any) => new Lesson(l.id, l.module_id, l.slug, l.title, l.description, l.order_index, l.xp_reward, l.coin_reward)),
      )
    )
  }

  async findModuleBySlug(slug: string): Promise<Module | null> {
    const { data: m, error } = await this.supabase
      .from('modules')
      .select('*, lessons(id, module_id, slug, title, description, order_index, xp_reward, coin_reward)')
      .eq('slug', slug)
      .single()

    if (error || !m) return null

    return new Module(
      m.id,
      m.slug,
      m.title,
      m.description,
      m.icon,
      m.color,
      m.order_index,
      m.is_free,
      ((m.lessons ?? []) as any[])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((l: any) => new Lesson(l.id, l.module_id, l.slug, l.title, l.description, l.order_index, l.xp_reward, l.coin_reward)),
    )
  }

  async findLessonWithExercises(lessonId: string): Promise<{ lesson: Lesson; exercises: Exercise[] } | null> {
    const { data: l, error: le } = await this.supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single()

    if (le || !l) return null

    const { data: exercises, error: ee } = await this.supabase
      .from('exercises')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('order_index')

    if (ee) throw new Error(ee.message)

    return {
      lesson: new Lesson(l.id, l.module_id, l.slug, l.title, l.description, l.order_index, l.xp_reward, l.coin_reward, l.theory ?? null),
      exercises: ((exercises ?? []) as any[]).map((e: any) =>
        new Exercise(
          e.id,
          e.lesson_id,
          e.question,
          e.context ?? null,
          e.type,
          Array.isArray(e.options) ? (e.options as string[]) : null,
          e.correct_answer,
          e.explanation,
          e.difficulty,
          e.order_index,
        )
      ),
    }
  }

  async findCompletedLessonIds(userId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('user_lesson_progress')
      .select('lesson_id')
      .eq('user_id', userId)

    if (error) throw new Error(error.message)
    return ((data ?? []) as any[]).map((d: any) => d.lesson_id as string)
  }

  async findRankedLessonStats(userId: string): Promise<{ easy: number; medium: number; hard: number; total: number }> {
    // Get all ranked modules
    const { data: rankedModules, error: moduleError } = await this.supabase
      .from('modules')
      .select('id')
      .eq('is_ranked', true)

    if (moduleError) throw new Error(moduleError.message)
    if (!rankedModules || rankedModules.length === 0) {
      return { easy: 0, medium: 0, hard: 0, total: 0 }
    }

    const moduleIds = rankedModules.map((m: any) => m.id)

    // Get all lessons from ranked modules
    const { data: lessons, error: lessonError } = await this.supabase
      .from('lessons')
      .select('id')
      .in('module_id', moduleIds)

    if (lessonError) throw new Error(lessonError.message)
    if (!lessons || lessons.length === 0) {
      return { easy: 0, medium: 0, hard: 0, total: 0 }
    }

    const lessonIds = lessons.map((l: any) => l.id)

    // Get completed lessons
    const completedLessonIds = await this.findCompletedLessonIds(userId)
    const completedRankedLessonIds = completedLessonIds.filter(id => lessonIds.includes(id))

    // Get exercises for completed ranked lessons and count by difficulty
    if (completedRankedLessonIds.length === 0) {
      return { easy: 0, medium: 0, hard: 0, total: 0 }
    }

    const { data: exercises, error: exerciseError } = await this.supabase
      .from('exercises')
      .select('difficulty')
      .in('lesson_id', completedRankedLessonIds)

    if (exerciseError) throw new Error(exerciseError.message)

    const difficulties = ((exercises ?? []) as any[]).reduce(
      (acc, e: any) => {
        if (e.difficulty === 'easy') acc.easy++
        else if (e.difficulty === 'medium') acc.medium++
        else if (e.difficulty === 'hard') acc.hard++
        return acc
      },
      { easy: 0, medium: 0, hard: 0 }
    )

    return {
      easy: difficulties.easy,
      medium: difficulties.medium,
      hard: difficulties.hard,
      total: (exercises ?? []).length,
    }
  }
}
