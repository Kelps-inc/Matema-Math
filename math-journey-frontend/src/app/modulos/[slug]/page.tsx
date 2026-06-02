import Link from 'next/link'
import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseLearningRepository } from '@/infrastructure/repositories/SupabaseLearningRepository'
import { GetModulesUseCase } from '@/application/use-cases/GetModulesUseCase'
import { ProgressBar } from '@/presentation/components/ui/ProgressBar'
import { Badge } from '@/presentation/components/ui/Badge'
import { notFound, redirect } from 'next/navigation'
import { cn } from '@/presentation/lib/utils'
import { Check, Lock, Zap, Coins } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ModuloDetailPage({ params }: Props) {
  const { slug } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const learningRepo = new SupabaseLearningRepository(supabase)
  const useCase = new GetModulesUseCase(learningRepo)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [modules, adminResult] = await Promise.all([
    useCase.execute(user.id),
    (supabase as any).from('user_profiles').select('is_admin').eq('id', user.id).single(),
  ])
  const isAdmin: boolean = adminResult.data?.is_admin ?? false
  const module = modules.find((m) => m.slug === slug)

  if (!module) notFound()

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Link href="/modulos" className="text-sm text-matema-muted hover:text-matema-dark flex items-center gap-1 mb-4">
          ← Voltar aos módulos
        </Link>

        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{ backgroundColor: `${module.color}20` }}
          >
            {module.icon}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-matema-dark">{module.title}</h1>
            <p className="text-matema-muted text-sm">{module.description}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-matema-border p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-matema-muted">{module.completedCount} de {module.totalCount} lições</span>
            <span className="font-semibold text-matema-dark">{module.progressPercent}%</span>
          </div>
          <ProgressBar value={module.progressPercent} max={100} color="primary" />
        </div>
      </div>

      <div className="space-y-3">
        {module.lessons.map((lesson, index) => {
          const isAvailable = isAdmin || index === 0 || module.lessons[index - 1].completed
          const isCompleted = lesson.completed

          return (
            <div key={lesson.id}>
              {isAvailable ? (
                <Link
                  href={`/licao/${lesson.id}`}
                  className={cn(
                    'block bg-white rounded-2xl border-2 p-5 transition-all duration-200',
                    isCompleted
                      ? 'border-green-200 hover:border-green-300'
                      : 'border-matema-border hover:border-matema-primary/50 hover:shadow-md hover:shadow-matema-dark/5 hover:-translate-y-0.5',
                  )}
                >
                  <LessonRow lesson={lesson} index={index} isCompleted={isCompleted} />
                </Link>
              ) : (
                <div className="block bg-white rounded-2xl border-2 border-matema-border p-5 opacity-50 cursor-not-allowed">
                  <LessonRow lesson={lesson} index={index} isCompleted={false} isLocked />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LessonRow({
  lesson,
  index,
  isCompleted,
  isLocked,
}: {
  lesson: { id: string; title: string; description: string; xpReward: number; coinReward: number }
  index: number
  isCompleted: boolean
  isLocked?: boolean
}) {
  return (
    <div className="flex items-center gap-4">
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
        isCompleted ? 'bg-green-100 text-green-700' : 'bg-matema-warm text-matema-muted',
      )}>
        {isCompleted ? (
          <Check className="w-5 h-5 text-green-700" strokeWidth={2} />
        ) : isLocked ? (
          <Lock className="w-4 h-4 text-matema-muted" strokeWidth={1.75} />
        ) : (
          index + 1
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-matema-dark leading-none mb-1">{lesson.title}</p>
        <p className="text-sm text-matema-muted leading-snug line-clamp-1">{lesson.description}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge variant="gold">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" strokeWidth={1.75} />
            {lesson.xpReward}
          </span>
        </Badge>
        <Badge variant="default">
          <span className="flex items-center gap-1">
            <Coins className="w-3 h-3" strokeWidth={1.75} />
            {lesson.coinReward}
          </span>
        </Badge>
      </div>
    </div>
  )
}
