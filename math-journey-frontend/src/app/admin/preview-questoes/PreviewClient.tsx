'use client'

import { useState } from 'react'
import { MathText } from '@/presentation/components/ui/MathText'
import { Badge } from '@/presentation/components/ui/Badge'
import { ProgressBar } from '@/presentation/components/ui/ProgressBar'
import { cn } from '@/presentation/lib/utils'
import { ChevronDown, BookOpen, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'

export interface LessonOption {
  lessonId: string
  lessonTitle: string
  moduleTitle: string
  moduleIcon: string
  moduleColor: string
  exerciseCount: number
}

export interface ExerciseRow {
  id: string
  orderIndex: number
  question: string
  context: string | null
  type: 'multiple_choice' | 'true_false' | 'numeric'
  options: string[]
  correctAnswer: string
  explanation: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  source: string | null
}

interface Props {
  lessons: LessonOption[]
  exercisesByLesson: Record<string, ExerciseRow[]>
}

const DIFF_LABEL: Record<string, string> = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' }
const LETTERS = ['A', 'B', 'C', 'D', 'E']

function issues(ex: ExerciseRow): string[] {
  const problems: string[] = []
  if (!ex.question?.trim()) problems.push('Sem enunciado')
  if (!ex.explanation?.trim()) problems.push('Sem explicação')
  if (ex.type === 'multiple_choice') {
    if (!ex.options || ex.options.length < 2) problems.push('Opções insuficientes')
    if (ex.correctAnswer && ex.options && !ex.options.includes(ex.correctAnswer))
      problems.push('Gabarito fora das opções')
  }
  if (!ex.correctAnswer?.trim()) problems.push('Sem gabarito')
  return problems
}

function ExerciseCard({ ex, index, total }: { ex: ExerciseRow; index: number; total: number }) {
  const [showExplanation, setShowExplanation] = useState(false)
  const problems = issues(ex)
  const isSvg = typeof ex.context === 'string' && ex.context.trimStart().startsWith('<svg')

  return (
    <div className={cn(
      'rounded-3xl border bg-white overflow-hidden',
      problems.length > 0 ? 'border-red-300 shadow-red-100 shadow-md' : 'border-matema-border'
    )}>
      {/* Barra de progresso simulada */}
      <div className="px-6 pt-5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-matema-muted">
            Questão {index + 1} de {total}
          </span>
          <div className="flex items-center gap-2">
            {ex.source && (
              <span className="text-xs bg-matema-cream border border-matema-border text-matema-muted font-medium px-2 py-0.5 rounded-full">
                {ex.source}
              </span>
            )}
            <Badge variant={ex.difficulty === 'easy' ? 'easy' : ex.difficulty === 'medium' ? 'medium' : 'hard'}>
              {DIFF_LABEL[ex.difficulty] ?? ex.difficulty}
            </Badge>
          </div>
        </div>
        <ProgressBar value={index} max={total} color="primary" />
      </div>

      {/* Alertas de problema */}
      {problems.length > 0 && (
        <div className="mx-6 mb-3 rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" strokeWidth={1.75} />
          <div>
            <p className="text-xs font-bold text-red-700 mb-1">Dados faltando:</p>
            <ul className="text-xs text-red-600 space-y-0.5">
              {problems.map((p) => <li key={p}>• {p}</li>)}
            </ul>
          </div>
        </div>
      )}

      {/* Corpo da questão — igual ao ExercisePlayer */}
      <div className="px-6 pb-5">
        {ex.context && (
          <div className="bg-matema-cream rounded-2xl p-4 mb-5 border border-matema-border overflow-x-auto">
            {isSvg
              ? <div dangerouslySetInnerHTML={{ __html: ex.context }} />
              : <p className="text-sm text-matema-muted leading-relaxed whitespace-pre-wrap"><MathText>{ex.context}</MathText></p>
            }
          </div>
        )}

        <h2 className="text-lg font-bold text-matema-dark mb-5 leading-snug">
          {ex.question
            ? <MathText>{ex.question}</MathText>
            : <span className="text-red-400 italic">Sem enunciado</span>
          }
        </h2>

        {/* Alternativas */}
        {ex.type === 'multiple_choice' && (
          <div className="grid gap-3">
            {(ex.options ?? []).map((opt, i) => {
              const correct = opt.trim().toLowerCase() === ex.correctAnswer?.trim().toLowerCase()
              return (
                <div key={i} className={cn(
                  'w-full text-left p-4 rounded-2xl border-2 font-medium flex items-center gap-3',
                  correct
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : 'border-matema-border text-matema-dark bg-white'
                )}>
                  <span className={cn(
                    'w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0',
                    correct
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-matema-border text-matema-muted'
                  )}>
                    {correct ? '✓' : LETTERS[i]}
                  </span>
                  <MathText>{opt}</MathText>
                </div>
              )
            })}
            {(!ex.options || ex.options.length === 0) && (
              <p className="text-sm text-red-400 italic">Sem alternativas cadastradas</p>
            )}
          </div>
        )}

        {ex.type === 'true_false' && (
          <div className="grid grid-cols-2 gap-3">
            {['Verdadeiro', 'Falso'].map((label) => {
              const correct = label.toLowerCase() === ex.correctAnswer?.trim().toLowerCase()
              return (
                <div key={label} className={cn(
                  'p-4 rounded-2xl border-2 font-semibold text-center',
                  correct
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : 'border-matema-border text-matema-dark'
                )}>
                  {label}
                </div>
              )
            })}
          </div>
        )}

        {ex.type === 'numeric' && (
          <div className="bg-matema-cream rounded-2xl p-4 border border-matema-border text-sm text-matema-muted">
            Resposta numérica — gabarito:{' '}
            <span className="font-bold text-green-700">{ex.correctAnswer || <span className="text-red-400">não definido</span>}</span>
          </div>
        )}

        {/* Explicação */}
        <div className="mt-4">
          <button
            onClick={() => setShowExplanation((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-matema-primary hover:opacity-80 transition-opacity"
          >
            <BookOpen className="w-3.5 h-3.5" strokeWidth={1.75} />
            {showExplanation ? 'Ocultar explicação' : 'Ver explicação'}
          </button>
          {showExplanation && (
            <div className={cn(
              'mt-3 rounded-2xl p-4 border text-sm leading-relaxed',
              ex.explanation
                ? 'bg-green-50 border-green-200 text-matema-dark'
                : 'bg-red-50 border-red-200 text-red-500 italic'
            )}>
              {ex.explanation
                ? <MathText>{ex.explanation}</MathText>
                : 'Sem explicação cadastrada'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function PreviewClient({ lessons, exercisesByLesson }: Props) {
  const [selectedId, setSelectedId] = useState<string>(lessons[0]?.lessonId ?? '')

  const selected = lessons.find((l) => l.lessonId === selectedId)
  const exercises = exercisesByLesson[selectedId] ?? []

  const totalProblems = exercises.reduce((acc, ex) => acc + issues(ex).length, 0)
  const easy   = exercises.filter((e) => e.difficulty === 'easy').length
  const medium = exercises.filter((e) => e.difficulty === 'medium').length
  const hard   = exercises.filter((e) => e.difficulty === 'hard').length

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-matema-muted mb-1">
          Admin · Preview de Questões
        </p>
        <h1 className="text-2xl font-extrabold text-matema-dark mb-5">
          Visualização do Jogo
        </h1>

        {/* Seletor de lição */}
        <div className="relative">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full appearance-none bg-white border-2 border-matema-border rounded-2xl px-4 py-3 pr-10 font-semibold text-matema-dark text-sm focus:outline-none focus:border-matema-primary cursor-pointer"
          >
            {/* Agrupado por módulo */}
            {Object.entries(
              lessons.reduce<Record<string, LessonOption[]>>((acc, l) => {
                const key = `${l.moduleIcon} ${l.moduleTitle}`
                if (!acc[key]) acc[key] = []
                acc[key].push(l)
                return acc
              }, {})
            ).map(([group, items]) => (
              <optgroup key={group} label={group}>
                {items.map((l) => (
                  <option key={l.lessonId} value={l.lessonId}>
                    {l.lessonTitle} ({l.exerciseCount} questões)
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-matema-muted pointer-events-none" />
        </div>

        {/* Stats da lição selecionada */}
        {selected && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-sm font-bold" style={{ color: selected.moduleColor }}>
              {selected.moduleIcon} {selected.moduleTitle}
            </span>
            <span className="text-matema-muted text-sm">·</span>
            <span className="text-sm text-matema-muted">{exercises.length} questões</span>
            <span className="text-xs text-green-700 font-semibold bg-green-50 border border-green-200 rounded-full px-2 py-0.5">{easy} fáceis</span>
            <span className="text-xs text-amber-700 font-semibold bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">{medium} médias</span>
            <span className="text-xs text-red-700 font-semibold bg-red-50 border border-red-200 rounded-full px-2 py-0.5">{hard} difíceis</span>
            {totalProblems > 0 ? (
              <span className="flex items-center gap-1 text-xs text-red-600 font-bold bg-red-50 border border-red-300 rounded-full px-2 py-0.5">
                <XCircle className="w-3 h-3" strokeWidth={2} />
                {totalProblems} problema{totalProblems > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-green-700 font-bold bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
                Tudo ok
              </span>
            )}
          </div>
        )}
      </div>

      {/* Questões */}
      {exercises.length === 0 ? (
        <div className="text-center py-20 text-matema-muted">
          Nenhuma questão encontrada para esta lição.
        </div>
      ) : (
        <div className="space-y-6">
          {exercises.map((ex, i) => (
            <ExerciseCard key={ex.id} ex={ex} index={i} total={exercises.length} />
          ))}
        </div>
      )}
    </div>
  )
}
