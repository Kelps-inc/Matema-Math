import { createClient } from '@/infrastructure/supabase/server'
import { redirect } from 'next/navigation'
import { PreviewClient } from './PreviewClient'
import type { LessonOption, ExerciseRow } from './PreviewClient'

export default async function PreviewQuestoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  // Verificar se é admin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')

  // Buscar todas as lições agrupadas por módulo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: lessonsRaw } = await (supabase as any)
    .from('lessons')
    .select(`
      id,
      title,
      order_index,
      modules (
        title,
        icon,
        color,
        order_index
      )
    `)
    .order('order_index')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lessonRows: any[] = lessonsRaw ?? []

  // Buscar contagem de exercícios por lição
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: countsRaw } = await (supabase as any)
    .from('exercises')
    .select('lesson_id')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const countMap: Record<string, number> = {}
  for (const row of (countsRaw ?? [])) {
    countMap[row.lesson_id] = (countMap[row.lesson_id] ?? 0) + 1
  }

  // Montar lista de lições ordenada por módulo → lição
  const lessons: LessonOption[] = lessonRows
    .sort((a, b) => {
      const modDiff = (a.modules?.order_index ?? 0) - (b.modules?.order_index ?? 0)
      return modDiff !== 0 ? modDiff : (a.order_index ?? 0) - (b.order_index ?? 0)
    })
    .map((l) => ({
      lessonId: l.id,
      lessonTitle: l.title,
      moduleTitle: l.modules?.title ?? 'Sem módulo',
      moduleIcon: l.modules?.icon ?? '📚',
      moduleColor: l.modules?.color ?? '#888',
      exerciseCount: countMap[l.id] ?? 0,
    }))

  // Buscar exercícios de todas as lições de uma vez
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: exercisesRaw } = await (supabase as any)
    .from('exercises')
    .select('id, lesson_id, order_index, question, context, type, options, correct_answer, explanation, difficulty, source')
    .order('order_index')

  // Agrupar por lesson_id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exercisesByLesson: Record<string, ExerciseRow[]> = {}
  for (const ex of (exercisesRaw ?? [])) {
    if (!exercisesByLesson[ex.lesson_id]) exercisesByLesson[ex.lesson_id] = []
    exercisesByLesson[ex.lesson_id].push({
      id: ex.id,
      orderIndex: ex.order_index,
      question: ex.question ?? '',
      context: ex.context ?? null,
      type: ex.type,
      options: Array.isArray(ex.options) ? ex.options : [],
      correctAnswer: ex.correct_answer ?? '',
      explanation: ex.explanation ?? null,
      difficulty: ex.difficulty,
      source: ex.source ?? null,
    })
  }

  return <PreviewClient lessons={lessons} exercisesByLesson={exercisesByLesson} />
}
