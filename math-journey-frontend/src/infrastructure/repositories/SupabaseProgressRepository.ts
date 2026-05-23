import type { SupabaseClient } from '@supabase/supabase-js'
import type { IProgressRepository, LessonCompletionResult } from '@/domain/progression/repositories/IProgressRepository'

/* eslint-disable @typescript-eslint/no-explicit-any */

export class SupabaseProgressRepository implements IProgressRepository {
  constructor(private readonly supabase: SupabaseClient<any>) {}

  async completedLessonIds(userId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('user_lesson_progress')
      .select('lesson_id')
      .eq('user_id', userId)

    if (error) throw new Error(error.message)
    return ((data ?? []) as any[]).map((d: any) => d.lesson_id as string)
  }

  async completeLesson(
    userId: string,
    lessonId: string,
    xpEarned: number,
    coinsEarned: number,
  ): Promise<LessonCompletionResult> {
    const { data: profile } = await this.supabase
      .from('user_profiles')
      .select('level, xp')
      .eq('id', userId)
      .single()

    const previousLevel = (profile as any)?.level ?? 1

    const { data, error } = await this.supabase.rpc('award_lesson_completion', {
      p_user_id: userId,
      p_lesson_id: lessonId,
      p_xp: xpEarned,
      p_coins: coinsEarned,
    })

    if (error) throw new Error(error.message)

    await this.supabase.from('user_lesson_progress').upsert({
      user_id: userId,
      lesson_id: lessonId,
      xp_earned: xpEarned,
      coins_earned: coinsEarned,
      completed_at: new Date().toISOString(),
    })

    const result = data as { xp: number; level: number; coins: number }

    return {
      newXp: result.xp,
      newLevel: result.level,
      newCoins: result.coins,
      leveledUp: result.level > previousLevel,
    }
  }

  async recordAnswer(userId: string, exerciseId: string, answer: string, isCorrect: boolean): Promise<void> {
    await this.supabase.from('user_exercise_answers').insert({
      user_id: userId,
      exercise_id: exerciseId,
      answer,
      is_correct: isCorrect,
    })
  }
}
