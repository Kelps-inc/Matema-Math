import { createClient } from '@/infrastructure/supabase/server'
import { redirect } from 'next/navigation'
import { PlacementPlayer } from '@/presentation/components/game/PlacementPlayer'

export default async function PlacementPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  // Check if already placed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('user_profiles')
    .select('placement_completed')
    .eq('id', user.id)
    .single()

  if (profile?.placement_completed) redirect('/ranqueada')

  // Fetch 15 random placement questions (4 easy, 6 medium, 5 hard)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseAny = supabase as any

  const [easyRes, mediumRes, hardRes] = await Promise.all([
    supabaseAny
      .from('placement_questions')
      .select('id, question, context, type, options, explanation, difficulty, topic')
      .eq('difficulty', 'easy')
      .limit(20),
    supabaseAny
      .from('placement_questions')
      .select('id, question, context, type, options, explanation, difficulty, topic')
      .eq('difficulty', 'medium')
      .limit(20),
    supabaseAny
      .from('placement_questions')
      .select('id, question, context, type, options, explanation, difficulty, topic')
      .eq('difficulty', 'hard')
      .limit(20),
  ])

  function pickRandom<T>(arr: T[], n: number): T[] {
    const shuffled = [...(arr ?? [])].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, n)
  }

  const selected = [
    ...pickRandom(easyRes.data ?? [], 4),
    ...pickRandom(mediumRes.data ?? [], 6),
    ...pickRandom(hardRes.data ?? [], 5),
  ].sort(() => Math.random() - 0.5)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questions = selected.map((q: any) => ({
    ...q,
    options: Array.isArray(q.options) ? q.options : null,
  }))

  return (
    <div className="animate-fade-in">
      <PlacementPlayer questions={questions} />
    </div>
  )
}
