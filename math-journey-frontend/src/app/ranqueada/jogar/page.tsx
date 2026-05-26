import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseUserRepository } from '@/infrastructure/repositories/SupabaseUserRepository'
import { redirect } from 'next/navigation'
import { RankedPlayer } from '@/presentation/components/game/RankedPlayer'
import type { EloTier } from '@/domain/user/entities/User'

// Lesson IDs for each difficulty level
const LESSON_SLUG: Record<string, string> = {
  easy:   'ranqueada-facil',
  medium: 'ranqueada-medio',
  hard:   'ranqueada-dificil',
}

const QUESTIONS_PER_GAME: Record<string, number> = {
  easy:   10,
  medium: 10,
  hard:   10,
}

export default async function RanqueadaJogarPage({
  searchParams,
}: {
  searchParams: Promise<{ difficulty?: string }>
}) {
  const params = await searchParams
  const difficulty = params.difficulty ?? 'easy'

  if (!['easy', 'medium', 'hard'].includes(difficulty)) redirect('/ranqueada')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const userRepo = new SupabaseUserRepository(supabase)
  const profile = await userRepo.findById(user.id)
  if (!profile) redirect('/entrar')
  if (!profile.placementCompleted) redirect('/ranqueada/placement')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseAny = supabase as any

  // Find the lesson by slug
  const { data: lesson } = await supabaseAny
    .from('lessons')
    .select('id')
    .eq('slug', LESSON_SLUG[difficulty])
    .single()

  if (!lesson) redirect('/ranqueada')

  // Fetch exercises for that lesson
  const { data: allExercises } = await supabaseAny
    .from('exercises')
    .select('id, question, context, type, options, correct_answer, explanation, difficulty')
    .eq('lesson_id', lesson.id)

  // Pick random subset
  function pickRandom<T>(arr: T[], n: number): T[] {
    return [...(arr ?? [])].sort(() => Math.random() - 0.5).slice(0, n)
  }

  const count = QUESTIONS_PER_GAME[difficulty] ?? 10
  const selected = pickRandom(allExercises ?? [], count)

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
        difficulty={difficulty}
        currentTier={profile.eloTier as EloTier}
        currentDivision={profile.eloDivision}
      />
    </div>
  )
}
