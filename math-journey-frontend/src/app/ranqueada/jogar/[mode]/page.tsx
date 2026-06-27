import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseUserRepository } from '@/infrastructure/repositories/SupabaseUserRepository'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap } from 'lucide-react'
import { RankedPlayer } from '@/presentation/components/game/RankedPlayer'
import { SimuladoGate } from '@/presentation/components/game/SimuladoGate'
import { getMyPowerupsAction } from '@/app/actions/powerups'
import type { EloTier } from '@/domain/user/entities/User'

// ── Mode config ────────────────────────────────────────────────────────────
const MODE_CONFIG = {
  objetivas: {
    slugs:        ['ranqueada-facil', 'ranqueada-medio', 'ranqueada-dificil'],
    questCount:   10,
    cooldownDays: 20,
  },
  enem: {
    slugs:        ['ranqueada-enem'],
    questCount:   5,
    cooldownDays: 7,
  },
  simulado: {
    slugs:        ['ranqueada-enem'],
    questCount:   45,
    cooldownDays: 30,
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
  const profile  = await userRepo.findById(user.id)
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

  // Find exercise IDs answered within cooldown window
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
    .select('id, question, context, type, options, explanation, difficulty, source')
    .in('lesson_id', lessonIds)

  const freshQuery = recentIds.length > 0
    ? baseQuery.not('id', 'in', `(${recentIds.map((id: string) => `"${id}"`).join(',')})`)
    : baseQuery

  const { data: freshExercises } = await freshQuery

  // Fallback: pad with oldest answered if not enough fresh
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

    const oldestIds = Array.from(new Set<string>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (oldestAnswered ?? []).map((a: any) => a.exercise_id as string),
    )).slice(0, needed)

    if (oldestIds.length > 0) {
      const { data: fallbackExercises } = await supabaseAny
        .from('exercises')
        .select('id, question, context, type, options, explanation, difficulty, source')
        .in('id', oldestIds)
        .in('lesson_id', lessonIds)
      allExercises = [...allExercises, ...(fallbackExercises ?? [])]
    }
  }

  function pickRandom<T>(arr: T[], n: number): T[] {
    return [...(arr ?? [])].sort(() => Math.random() - 0.5).slice(0, n)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normaliseExercise = (e: any) => ({ ...e, options: Array.isArray(e.options) ? e.options : null })

  const selected  = pickRandom(allExercises, cfg.questCount)
  const exercises = selected.map(normaliseExercise)

  // ── SIMULADO mode: special handling ──────────────────────────────────────
  if (mode === 'simulado') {
    // Gate Pro: Simulado ENEM exige assinatura Pro (admins têm bypass).
    if (!profile.hasProAccess()) redirect('/pro')

    // Check for an existing saved session
    const { data: sessionData } = await supabaseAny
      .from('simulado_sessions')
      .select('exercise_ids, answers, time_remaining_ms')
      .eq('user_id', user.id)
      .single()

    let savedSession: { exerciseIds: string[]; answers: Record<string, string>; timeRemainingMs: number } | undefined
    let savedExercises: ReturnType<typeof normaliseExercise>[] | undefined

    if (sessionData) {
      savedSession = {
        exerciseIds:     sessionData.exercise_ids ?? [],
        answers:         sessionData.answers ?? {},
        timeRemainingMs: sessionData.time_remaining_ms ?? 9900000,
      }
      const { data: savedEx } = await supabaseAny
        .from('exercises')
        .select('id, question, context, type, options, correct_answer, explanation, difficulty, source')
        .in('id', sessionData.exercise_ids)
      savedExercises = (savedEx ?? []).map(normaliseExercise)
    }

    // Guard: need at least 45 exercises (if no saved session to resume)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let simuladoExercises: any[] = exercises
    if (!savedSession && simuladoExercises.length < 45) {
      if (!profile.isAdmin) {
        return (
          <div className="max-w-xl mx-auto py-20 text-center animate-fade-in">
            <GraduationCap className="w-14 h-14 text-matema-muted mx-auto mb-4" strokeWidth={1.5} />
            <h2 className="text-xl font-extrabold text-matema-dark mb-2">Simulado em breve</h2>
            <p className="text-matema-muted text-sm mb-1">
              Temos apenas <strong>{simuladoExercises.length}</strong> de 45 questões necessárias para o Simulado.
            </p>
            <p className="text-matema-muted text-sm mb-6">
              Novas questões estão sendo adicionadas. Volte em breve!
            </p>
            <Link
              href="/ranqueada/jogar"
              className="inline-block bg-matema-primary text-white font-bold px-6 py-3 rounded-2xl hover:opacity-90 transition-opacity"
            >
              ← Escolher outro modo
            </Link>
          </div>
        )
      }

      // Admin: pad to 45 with any available questions from the same lessons (repeats OK)
      const { data: anyEx } = await supabaseAny
        .from('exercises')
        .select('id, question, context, type, options, correct_answer, explanation, difficulty, source')
        .in('lesson_id', lessonIds)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pool = (anyEx ?? []).map((e: any) => normaliseExercise(e))
      if (pool.length > 0) {
        const padded = [...simuladoExercises]
        while (padded.length < 45) padded.push(pool[Math.floor(Math.random() * pool.length)])
        simuladoExercises = padded
      }
    }

    return (
      <div className="animate-fade-in">
        <SimuladoGate
          freshExercises={simuladoExercises}
          savedSession={savedSession}
          savedExercises={savedExercises}
          currentTier={profile.eloTier as EloTier}
          currentDivision={profile.eloDivision}
          currentLp={profile.eloLp}
        />
      </div>
    )
  }

  // ── Other modes: regular RankedPlayer ────────────────────────────────────
  if (exercises.length === 0) redirect('/ranqueada')

  const powerups = await getMyPowerupsAction()

  return (
    <div className="animate-fade-in">
      <RankedPlayer
        exercises={exercises}
        difficulty="mixed"
        currentTier={profile.eloTier as EloTier}
        currentDivision={profile.eloDivision}
        currentLp={profile.eloLp}
        useSerif={mode === 'enem'}
        powerups={powerups}
      />
    </div>
  )
}
