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

  async findRankedLessonStats(userId: string): Promise<{
    easy: number; medium: number; hard: number; total: number
    correct: number; wrong: number; skipped: number
  }> {
    const { data, error } = await (this.supabase as any)
      .from('user_exercise_answers')
      .select('is_correct, is_skipped, exercises(difficulty)')
      .eq('user_id', userId)
      .eq('is_ranked', true)

    if (error) return { easy: 0, medium: 0, hard: 0, total: 0, correct: 0, wrong: 0, skipped: 0 }

    const rows = (data ?? []) as any[]
    const counts = rows.reduce(
      (acc, row: any) => {
        if (row.is_skipped) { acc.skipped++; return acc }
        const diff = row.exercises?.difficulty
        if (diff === 'easy')        acc.easy++
        else if (diff === 'medium') acc.medium++
        else if (diff === 'hard')   acc.hard++
        if (row.is_correct) acc.correct++
        else                acc.wrong++
        return acc
      },
      { easy: 0, medium: 0, hard: 0, correct: 0, wrong: 0, skipped: 0 },
    )

    return { ...counts, total: rows.length - counts.skipped }
  }
}
