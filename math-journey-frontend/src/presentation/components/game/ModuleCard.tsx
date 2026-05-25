import Link from 'next/link'
import { ProgressBar } from '@/presentation/components/ui/ProgressBar'
import { cn } from '@/presentation/lib/utils'
import type { ModuleWithProgress } from '@/application/use-cases/GetModulesUseCase'

interface ModuleCardProps {
  module: ModuleWithProgress
  isAdmin?: boolean
}

export function ModuleCard({ module, isAdmin = false }: ModuleCardProps) {
  const isLocked = !isAdmin && !module.isFree && module.completedCount === 0

  return (
    <Link
      href={isLocked ? '#' : `/modulos/${module.slug}`}
      className={cn(
        'group block bg-white rounded-3xl p-6 border border-matema-border transition-all duration-200',
        isLocked
          ? 'opacity-60 cursor-not-allowed'
          : 'hover:shadow-lg hover:shadow-matema-dark/8 hover:-translate-y-0.5',
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ backgroundColor: `${module.color}20` }}
        >
          {module.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-matema-dark text-base leading-tight">{module.title}</h3>
            {isLocked && <span className="text-sm">🔒</span>}
          </div>
          <p className="text-sm text-matema-muted leading-snug line-clamp-2 mb-3">{module.description}</p>

          <div className="flex items-center gap-3">
            <ProgressBar
              value={module.completedCount}
              max={module.totalCount}
              color="primary"
              size="sm"
              className="flex-1"
            />
            <span className="text-xs text-matema-muted whitespace-nowrap">
              {module.completedCount}/{module.totalCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
