'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { submitDuelAnswersAction } from '@/app/actions/duelo'
import type { DuelExercise, DuelAnswer } from '@/app/actions/duelo'
import { MathText } from '@/presentation/components/ui/MathText'
import { Loader2 } from 'lucide-react'
import { cn } from '@/presentation/lib/utils'

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const

interface DuelPlayerProps {
  duelId: string
  exercises: DuelExercise[]
  opponentName: string
}

export function DuelPlayer({ duelId, exercises, opponentName }: DuelPlayerProps) {
  const router  = useRouter()
  const [current,  setCurrent]  = useState(0)
  const [selected, setSelected] = useState<Record<string, string>>({}) // exerciseId → chosen option
  const [phase,    setPhase]    = useState<'playing' | 'submitting' | 'done'>('playing')
  const [error,    setError]    = useState('')

  // Track time spent per question
  const questionStartRef = useRef<number>(Date.now())
  const timingsRef       = useRef<Record<string, number>>({})

  const exercise = exercises[current]

  const handleSelect = useCallback((option: string) => {
    if (selected[exercise.id] !== undefined) return // already answered
    const elapsed = Date.now() - questionStartRef.current
    timingsRef.current[exercise.id] = elapsed
    setSelected((prev) => ({ ...prev, [exercise.id]: option }))

    // Auto-advance after brief delay
    setTimeout(() => {
      if (current < exercises.length - 1) {
        setCurrent((c) => c + 1)
        questionStartRef.current = Date.now()
      }
    }, 500)
  }, [exercise, current, exercises.length, selected])

  const handleSubmit = useCallback(async () => {
    setPhase('submitting')
    setError('')

    const answers: DuelAnswer[] = exercises.map((ex) => ({
      exerciseId: ex.id,
      answer:     selected[ex.id] ?? '',
      isCorrect:  (selected[ex.id] ?? '') === ex.correct_answer,
      timeMs:     timingsRef.current[ex.id] ?? 0,
    }))

    const res = await submitDuelAnswersAction(duelId, answers)
    if (res.error) {
      setError(res.error)
      setPhase('playing')
      return
    }

    setPhase('done')
    router.refresh()
  }, [duelId, exercises, selected, router])

  const answered    = Object.keys(selected).length
  const allAnswered = answered >= exercises.length

  if (phase === 'submitting') {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-10 h-10 text-matema-accent animate-spin" strokeWidth={1.5} />
        <p className="font-bold text-matema-dark">Enviando respostas...</p>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <p className="text-4xl">✅</p>
        <p className="font-extrabold text-matema-dark text-lg">Respostas enviadas!</p>
        <p className="text-sm text-matema-muted">Agora é a vez de <strong>{opponentName}</strong>. Você será avisado quando o resultado sair.</p>
      </div>
    )
  }

  const isAnswered = selected[exercise.id] !== undefined

  return (
    <div className="max-w-xl mx-auto animate-fade-in">

      {/* Progress */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex gap-1.5 flex-1">
          {exercises.map((ex, i) => (
            <div
              key={ex.id}
              className={cn(
                'h-2 flex-1 rounded-full transition-all',
                i < current   ? 'bg-matema-accent'
                : i === current ? 'bg-matema-accent/40'
                : 'bg-matema-border',
                selected[ex.id] !== undefined && i <= current ? 'bg-matema-accent' : '',
              )}
            />
          ))}
        </div>
        <span className="text-xs font-bold text-matema-muted tabular-nums">{current + 1}/{exercises.length}</span>
      </div>

      {/* vs banner */}
      <p className="text-[11px] text-matema-muted mb-4 text-center font-semibold uppercase tracking-wider">
        vs <span className="text-matema-accent">{opponentName}</span> · sem feedback — responda e aguarde o resultado
      </p>

      {/* Question card */}
      <div className="bg-white rounded-3xl border border-matema-border p-5 shadow-sm">
        {exercise.context && (
          <div className="bg-matema-cream rounded-2xl p-3 mb-4 text-sm text-matema-muted leading-relaxed">
            {exercise.context.trimStart().startsWith('<svg') ? (
              <div
                className="[&_svg]:w-full [&_svg]:h-auto [&_svg]:block"
                dangerouslySetInnerHTML={{ __html: exercise.context }}
              />
            ) : (
              <MathText>{exercise.context}</MathText>
            )}
          </div>
        )}
        <p className="font-semibold text-matema-dark mb-4 leading-relaxed text-sm">
          <MathText>{exercise.question}</MathText>
        </p>

        <div className="space-y-2">
          {(exercise.options ?? []).map((opt, i) => {
            const letter   = OPTION_LETTERS[i] ?? String(i + 1)
            const isChosen = selected[exercise.id] === opt

            return (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                disabled={isAnswered}
                className={cn(
                  'w-full flex items-start gap-3 px-4 py-3 rounded-2xl border-2 text-left text-sm transition-all',
                  isAnswered && isChosen
                    ? 'border-matema-accent bg-matema-accent/10 text-matema-dark'
                    : isAnswered
                    ? 'border-matema-border text-matema-muted opacity-50 cursor-not-allowed'
                    : 'border-matema-border text-matema-dark hover:border-matema-accent/50 hover:bg-matema-accent/5 active:scale-[0.98]',
                )}
              >
                <span className={cn(
                  'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-extrabold leading-none',
                  isAnswered && isChosen ? 'border-matema-accent text-matema-accent' : 'border-matema-border text-matema-muted',
                )}>
                  {letter}
                </span>
                <span className="leading-snug"><MathText>{opt}</MathText></span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Submit (visible on last question) */}
      {current === exercises.length - 1 && allAnswered && (
        <button
          onClick={handleSubmit}
          className="mt-5 w-full bg-matema-accent text-white font-extrabold py-4 rounded-3xl hover:opacity-90 active:scale-[0.98] transition-all shadow-md text-lg"
        >
          Enviar respostas →
        </button>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600 text-center">{error}</p>
      )}

      {/* Navigation (only forward — no going back like Perguntados) */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => { setCurrent((c) => Math.max(0, c - 1)); questionStartRef.current = Date.now() }}
          disabled={current === 0}
          className="text-sm text-matema-muted hover:text-matema-dark disabled:opacity-30 transition-colors px-2 py-1"
        >
          ← Anterior
        </button>
        {current < exercises.length - 1 && (
          <button
            onClick={() => { setCurrent((c) => c + 1); questionStartRef.current = Date.now() }}
            className="text-sm text-matema-accent hover:opacity-80 transition-colors font-semibold px-2 py-1"
          >
            Próxima →
          </button>
        )}
      </div>
    </div>
  )
}
