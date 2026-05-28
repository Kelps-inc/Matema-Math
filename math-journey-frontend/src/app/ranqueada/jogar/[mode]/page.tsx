import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseUserRepository } from '@/infrastructure/repositories/SupabaseUserRepository'
import { redirect } from 'next/navigation'
import { RankedPlayer } from '@/presentation/components/game/RankedPlayer'
import type { EloTier } from '@/domain/user/entities/User'

// ── Mode config ────────────────────────────────────────────────────────────
const MODE_CONFIG = {
  objetivas: {
    slugs:      ['ranqueada-facil', 'ranqueada-medio', 'ranqueada-dificil'],
    questCount: 10,
    cooldownDays: 20,
  },
  enem: {
    slugs:      ['ranqueada-enem'],
    questCount: 5,
    cooldownDays: 7,
  },
} as const

type RankedMode = keyof typeof MODE_CONFIG

export default async function RanqueadaJogarModePage({
  params,
}: {
  params: Promise<{ mode: string }>
}) {
  const { mode } = await params

  if (!(mode in MODE_CONFIG)) redirect('/ranqueada/jogar')
  const cfg = MODE_CONFIG[mode as RankedMode]

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const userRepo = new SupabaseUserRepository(supabase)
  const profile = await userRepo.findById(user.id)
  if (!profile) redirect('/entrar')
  if (!profile.placementCompleted) redirect('/ranqueada/placement')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseAny = supabase as any

  // Fetch lessons for this mode
  const { data: lessons } = await supabaseAny
    .from('lessons')
    .select('id')
    .in('slug', cfg.slugs)

  if (!lessons || lessons.length === 0) redirect('/ranqueada')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lessonIds = (lessons as any[]).map((l: any) => l.id)

  // Find exercise IDs the user answered within the cooldown window
  const cooldownSince = new Date(Date.now() - cfg.cooldownDays * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentAnswers } = await supabaseAny
    .from('user_exercise_answers')
    .select('exercise_id')
    .eq('user_id', user.id)
    .eq('is_ranked', true)
    .gte('answered_at', cooldownSince)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentIds = Array.from(new Set<string>((recentAnswers ?? []).map((a: any) => a.exercise_id as string)))

  // Fetch eligible (fresh) exercises
  const baseQuery = supabaseAny
    .from('exercises')
    .select('id, question, context, type, options, correct_answer, explanation, difficulty, source')
    .in('lesson_id', lessonIds)

  const freshQuery = recentIds.length > 0
    ? baseQuery.not('id', 'in', `(${recentIds.map((id: string) => `"${id}"`).join(',')})`)
    : baseQuery

  const { data: freshExercises } = await freshQuery

  // Fallback: pad with oldest answered if not enough fresh questions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let allExercises: any[] = freshExercises ?? []
  if (allExercises.length < cfg.questCount && recentIds.length > 0) {
    const needed = cfg.questCount - allExercises.length
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
        .select('id, question, context, type, options, correct_answer, explanation, difficulty, source')
        .in('id', oldestIds)
      allExercises = [...allExercises, ...(fallbackExercises ?? [])]
    }
  }

  function pickRandom<T>(arr: T[], n: number): T[] {
    return [...(arr ?? [])].sort(() => Math.random() - 0.5).slice(0, n)
  }

  const selected = pickRandom(allExercises, cfg.questCount)

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
