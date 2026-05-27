import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseUserRepository } from '@/infrastructure/repositories/SupabaseUserRepository'
import { redirect } from 'next/navigation'
import { RankedPlayer } from '@/presentation/components/game/RankedPlayer'
import type { EloTier } from '@/domain/user/entities/User'

const RANKED_LESSON_SLUGS = ['ranqueada-facil', 'ranqueada-medio', 'ranqueada-dificil']
const QUESTIONS_PER_GAME = 10

export default async function RanqueadaJogarPage() {
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

  // Fetch all exercises from those lessons
  const { data: allExercises } = await supabaseAny
    .from('exercises')
    .select('id, question, context, type, options, correct_answer, explanation, difficulty')
    .in('lesson_id', lessonIds)

  function pickRandom<T>(arr: T[], n: number): T[] {
    return [...(arr ?? [])].sort(() => Math.random() - 0.5).slice(0, n)
  }

  const selected = pickRandom(allExercises ?? [], QUESTIONS_PER_GAME)

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
