import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseUserRepository } from '@/infrastructure/repositories/SupabaseUserRepository'
import { redirect } from 'next/navigation'
import { RankedPlayer } from '@/presentation/components/game/RankedPlayer'
import type { EloTier } from '@/domain/user/entities/User'

const RANKED_LESSON_SLUGS = ['ranqueada-facil', 'ranqueada-medio', 'ranqueada-dificil']
const QUESTIONS_PER_GAME = 10
const COOLDOWN_DAYS = 20

export default async function RanqueadaJogarModePage({
  params,
}: {
  params: Promise<{ mode: string }>
}) {
  const { mode } = await params

  // Only 'objetivas' is live — everything else goes back to mode selection
  if (mode !== 'objetivas') redirect('/ranqueada/jogar')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const userRepo = new SupabaseUserRepository(supabase)
  const profile = await userRepo.findById(user.id)
  if (!profile) redirect('/entrar')
  if (!profile.placementCompleted) redirect('/ranqueada/placement')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseAny = supabase as any

  // Fetch all ranked lessons
  const { data: lessons } = await supabaseAny
    .from('lessons')
    .select('id')
    .in('slug', RANKED_LESSON_SLUGS)

  if (!lessons || lessons.length === 0) redirect('/ranqueada')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lessonIds = (lessons as any[]).map((l: any) => l.id)

  // Find exercise IDs the user answered in the last COOLDOWN_DAYS days
  const cooldownSince = new Date(Date.now() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentAnswers } = await supabaseAny
    .from('user_exercise_answers')
    .select('exercise_id')
    .eq('user_id', user.id)
    .eq('is_ranked', true)
    .gte('answered_at', cooldownSince)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentIds = Array.from(new Set<string>((recentAnswers ?? []).map((a: any) => a.exercise_id as string)))

  // Fetch eligible (fresh) exercises, excluding recently answered ones
  const baseQuery = supabaseAny
    .from('exercises')
    .select('id, question, context, type, options, correct_answer, explanation, difficulty')
    .in('lesson_id', lessonIds)

  const freshQuery = recentIds.length > 0
    ? baseQuery.not('id', 'in', `(${recentIds.map((id: string) => `"${id}"`).join(',')})`)
    : baseQuery

  const { data: freshExercises } = await freshQuery

  // Fallback: if not enough fresh questions, pad with the least-recently answered ones
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let allExercises: any[] = freshExercises ?? []
  if (allExercises.length < QUESTIONS_PER_GAME && recentIds.length > 0) {
    const needed = QUESTIONS_PER_GAME - allExercises.length
    const { data: oldestAnswered } = await supabaseAny
      .from('user_exercise_answers')
      .select('exercise_id')
      .eq('user_id', user.id)
      .eq('is_ranked', true)
      .order('answered_at', { ascending: true })
      .limit(needed * 3)

    const oldestIds = Array.from(new Set<string>((oldestAnswered ?? []).map((a: any) => a.exercise_id as string))).slice(0, needed)

    if (oldestIds.length > 0) {
      const { data: fallbackExercises } = await supabaseAny
        .from('exercises')
        .select('id, question, context, type, options, correct_answer, explanation, difficulty')
        .in('id', oldestIds)
      allExercises = [...allExercises, ...(fallbackExercises ?? [])]
    }
  }

  function pickRandom<T>(arr: T[], n: number): T[] {
    return [...(arr ?? [])].sort(() => Math.random() - 0.5).slice(0, n)
  }

  const selected = pickRandom(allExercises, QUESTIONS_PER_GAME)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exercises = selected.map((e: any) => ({
    ...e,
    options: Array.isArray(e.options) ? e.options : null,
  }))

  if (exercises.length === 0) redirect('/ranqueada')

  return (
    <div className="animate-fade-in">
      <RankedPlayer
        exercises={exercises}
        difficulty="mixed"
        currentTier={profile.eloTier as EloTier}
        currentDivision={profile.eloDivision}
        currentLp={profile.eloLp}
      />
    </div>
  )
}
