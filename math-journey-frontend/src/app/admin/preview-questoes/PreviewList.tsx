'use client'

import { MathText } from '@/presentation/components/ui/MathText'

const DIFF_COLOR: Record<string, string> = {
  easy:   'text-green-700 bg-green-100 border-green-300',
  medium: 'text-amber-700 bg-amber-100 border-amber-300',
  hard:   'text-red-700   bg-red-100   border-red-300',
}
const DIFF_LABEL: Record<string, string> = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' }

interface Exercise {
  id: string
  order_index: number
  question: string
  context: string | null
  options: string[] | null
  correct_answer: string
  explanation: string | null
  difficulty: string
  source: string | null
}

export function PreviewList({ exercises }: { exercises: Exercise[] }) {
  return (
    <div className="space-y-6">
      {exercises.map((ex) => {
        const hasSvg = !!ex.context?.trimStart().startsWith('<svg')
        return (
          <div key={ex.id} className="bg-white rounded-3xl border border-matema-border p-5 shadow-sm">

            {/* Badges */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs font-bold text-matema-muted bg-matema-cream px-2.5 py-0.5 rounded-full border border-matema-border">
                Q{String(ex.order_index).padStart(2, '0')}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${DIFF_COLOR[ex.difficulty] ?? ''}`}>
                {DIFF_LABEL[ex.difficulty] ?? ex.difficulty}
              </span>
              <span className="text-xs text-matema-muted px-2.5 py-0.5 rounded-full bg-matema-cream border border-matema-border">
                {ex.source ?? '—'}
              </span>
              {hasSvg && (
                <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                  🖼 SVG
                </span>
              )}
            </div>

            {/* Contexto */}
            {ex.context && (
              <div className="bg-matema-cream rounded-2xl p-3 mb-3 border border-matema-border overflow-x-auto">
                {hasSvg ? (
                  <div dangerouslySetInnerHTML={{ __html: ex.context }} />
                ) : (
                  <p className="text-sm text-matema-muted leading-relaxed">
                    <MathText>{ex.context}</MathText>
                  </p>
                )}
              </div>
            )}

            {/* Enunciado */}
            <p className="font-semibold text-matema-dark text-sm leading-relaxed mb-3">
              <MathText>{ex.question}</MathText>
            </p>

            {/* Alternativas */}
            <div className="space-y-1.5">
              {(ex.options ?? []).map((opt, i) => {
                const isCorrect = opt.trim().toLowerCase() === (ex.correct_answer ?? '').trim().toLowerCase()
                return (
                  <div
                    key={i}
                    className={`px-4 py-2.5 rounded-2xl border-2 text-sm font-medium flex items-center gap-2 ${
                      isCorrect
                        ? 'border-green-400 bg-green-50 text-green-800'
                        : 'border-matema-border bg-white text-matema-dark opacity-70'
                    }`}
                  >
                    <span className="shrink-0 text-xs font-bold w-4 text-center">
                      {['A', 'B', 'C', 'D', 'E'][i]}
                    </span>
                    <MathText>{opt}</MathText>
                    {isCorrect && <span className="ml-auto text-xs font-bold text-green-600">✓</span>}
                  </div>
                )
              })}
            </div>

            {/* Explicação colapsável */}
            {ex.explanation && (
              <details className="mt-3">
                <summary className="text-xs font-semibold text-matema-primary cursor-pointer hover:underline list-none flex items-center gap-1">
                  💡 Ver explicação
                </summary>
                <div className="mt-2 text-xs text-matema-muted leading-relaxed bg-matema-cream rounded-2xl p-3 border border-matema-border whitespace-pre-line">
                  {ex.explanation}
                </div>
              </details>
            )}
          </div>
        )
      })}

      {exercises.length === 0 && (
        <div className="text-center py-20 text-matema-muted">
          Nenhuma questão encontrada.
        </div>
      )}
    </div>
  )
}
