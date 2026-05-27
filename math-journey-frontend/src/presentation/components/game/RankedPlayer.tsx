'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/presentation/lib/utils'
import { MathText } from '@/presentation/components/ui/MathText'
import { saveRankedGameAction, type RankedAnswer } from '@/app/actions/ranked'
import { ELO_TIER_LABELS, ELO_TIER_ICONS, type EloTier } from '@/domain/user/entities/User'

export interface RankedExercise {
  id: string
  question: string
  context: string | null
  type: 'multiple_choice' | 'true_false' | 'numeric'
  options: string[] | null
  correct_answer: string
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface RankedPlayerProps {
  exercises: RankedExercise[]
  difficulty: string
  currentTier: EloTier
  currentDivision: number
  currentLp: number
}

type Phase = 'playing' | 'answered' | 'saving' | 'result'

const MIN_QUESTIONS_TO_SAVE = 3

export function RankedPlayer({ exercises, difficulty, currentTier, currentDivision, currentLp }: RankedPlayerProps) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('playing')
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answers, setAnswers] = useState<RankedAnswer[]>([])
  const [elapsedMs, setElapsedMs] = useState(0)
  const [result, setResult] = useState<{
    score: number; accuracy: number; correct: number; total: number
    lpChange: number; newLp: number; newTier: EloTier; newDivision: number
    promoted: boolean; demoted: boolean
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const questionStartRef = useRef<number>(Date.now())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const exercise = exercises[current]

  useEffect(() => {
    if (phase !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    questionStartRef.current = Date.now()
    setElapsedMs(0)
    timerRef.current = setInterval(() => setElapsedMs(Date.now() - questionStartRef.current), 100)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase, current])

  const handleSelect = useCallback((option: string) => {
    if (phase !== 'playing') return
    setSelected(option)
    setPhase('answered')
    if (timerRef.current) clearInterval(timerRef.current)
  }, [phase])

  const handleNext = useCallback(async () => {
    if (!selected || !exercise) return

    const timeMs = Date.now() - questionStartRef.current
    const isCorrect = selected.trim().toLowerCase() === exercise.correct_answer.trim().toLowerCase()
    const newAnswers: RankedAnswer[] = [
      ...answers,
      { exerciseId: exercise.id, answer: selected, isCorrect, timeMs },
    ]
    setAnswers(newAnswers)

    if (current + 1 < exercises.length) {
      setCurrent((c) => c + 1)
      setSelected(null)
      setPhase('playing')
    } else {
      setPhase('saving')
      const res = await saveRankedGameAction(newAnswers)
      if (res.error) { setError(res.error); return }
      setResult({
        score:       res.score!,
        accuracy:    res.accuracy!,
        correct:     res.correct!,
        total:       res.total!,
        lpChange:    res.lpChange!,
        newLp:       res.newLp!,
        newTier:     res.newTier as EloTier,
        newDivision: res.newDivision!,
        promoted:    res.promoted!,
        demoted:     res.demoted!,
      })
      setPhase('result')
    }
  }, [selected, exercise, answers, current, exercises.length])

  const handleExit = useCallback(async () => {
    // Include current question if already answered
    const exitAnswers: RankedAnswer[] = phase === 'answered' && selected && exercise
      ? [...answers, {
          exerciseId: exercise.id,
          answer: selected,
          isCorrect: selected.trim().toLowerCase() === exercise.correct_answer.trim().toLowerCase(),
          timeMs: Date.now() - questionStartRef.current,
        }]
      : answers

    if (exitAnswers.length < MIN_QUESTIONS_TO_SAVE) {
      router.push('/ranqueada')
      return
    }

    setPhase('saving')
    const res = await saveRankedGameAction(exitAnswers)
    if (res.error) { setError(res.error); return }
    setResult({
      score:       res.score!,
      accuracy:    res.accuracy!,
      correct:     res.correct!,
      total:       res.total!,
      lpChange:    res.lpChange!,
      newLp:       res.newLp!,
      newTier:     res.newTier as EloTier,
      newDivision: res.newDivision!,
      promoted:    res.promoted!,
      demoted:     res.demoted!,
    })
    setPhase('result')
  }, [phase, selected, exercise, answers, router])

  // ── SAVING ─────────────────────────────────────────────────────────────────
  if (phase === 'saving') {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <div className="text-5xl mb-4 animate-spin inline-block">⚙️</div>
        <p className="text-matema-muted">Calculando resultado…</p>
        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
      </div>
    )
  }

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    const tierIcon  = ELO_TIER_ICONS[result.newTier]
    const tierLabel = ELO_TIER_LABELS[result.newTier]
    const divLabel  = result.newTier === 'mestre' ? '' : ` ${['', 'I', 'II', 'III', 'IV'][result.newDivision] ?? result.newDivision}`
    const lpSign    = result.lpChange >= 0 ? '+' : ''
    const lpColor   = result.lpChange >= 0 ? 'text-green-600' : 'text-red-500'

    return (
      <div className="max-w-xl mx-auto animate-fade-in">
        <div className="bg-white rounded-3xl border border-matema-border p-8 text-center shadow-sm">
          {result.promoted ? (
            <>
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-xl font-extrabold text-matema-dark mb-1">Promovido!</h2>
              <p className="text-matema-muted text-sm mb-4">Você subiu de divisão!</p>
            </>
          ) : result.demoted ? (
            <>
              <div className="text-4xl mb-2">📉</div>
              <h2 className="text-xl font-extrabold text-matema-dark mb-1">Rebaixado</h2>
              <p className="text-matema-muted text-sm mb-4">Você desceu de divisão.</p>
            </>
          ) : (
            <>
              <div className="text-4xl mb-2">💪</div>
              <h2 className="text-xl font-extrabold text-matema-dark mb-1">Partida concluída</h2>
              <p className="text-matema-muted text-sm mb-4">Continue jogando para subir!</p>
            </>
          )}

          <div className="text-6xl mb-2">{tierIcon}</div>
          <p className="text-2xl font-extrabold text-matema-dark">{tierLabel}{divLabel}</p>

          {/* LP display */}
          {result.newTier !== 'mestre' ? (
            <div className="mt-3 mb-6">
              <div className="flex justify-between text-xs text-matema-muted mb-1.5">
                <span className={cn('font-bold text-sm', lpColor)}>
                  {lpSign}{result.lpChange} PDL
                </span>
                <span>{result.newLp} / 100 PDL</span>
              </div>
              <div className="h-2.5 bg-matema-border rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700',
                    result.promoted ? 'bg-green-500' : result.demoted ? 'bg-red-400' : 'bg-matema-primary',
                  )}
                  style={{ width: `${result.newLp}%` }}
                />
              </div>
            </div>
          ) : (
            <p className={cn('text-sm font-bold mt-2 mb-6', lpColor)}>
              {lpSign}{result.lpChange} PDL &middot; {result.newLp} PDL total
            </p>
          )}

          <div className="grid grid-cols-3 gap-3 mb-8 text-sm">
            <div className="bg-matema-cream border border-matema-border rounded-2xl p-3">
              <div className="text-xl font-extrabold text-matema-dark">{result.correct}/{result.total}</div>
              <div className="text-matema-muted text-xs">Acertos</div>
            </div>
            <div className="bg-matema-cream border border-matema-border rounded-2xl p-3">
              <div className="text-xl font-extrabold text-matema-dark">{result.accuracy}%</div>
              <div className="text-matema-muted text-xs">Precisão</div>
            </div>
            <div className="bg-matema-cream border border-matema-border rounded-2xl p-3">
              <div className="text-xl font-extrabold text-matema-dark">{result.score}</div>
              <div className="text-matema-muted text-xs">Pontuação</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/ranqueada')}
              className="flex-1 border-2 border-matema-border text-matema-dark font-bold py-3 rounded-2xl hover:bg-matema-warm transition-colors"
            >
              Meu perfil
            </button>
            <button
              onClick={() => router.push(`/ranqueada/jogar?difficulty=${difficulty}`)}
              className="flex-1 bg-matema-primary text-white font-bold py-3 rounded-2xl hover:opacity-90 transition-opacity"
            >
              Jogar de novo
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── PLAYING / ANSWERED ────────────────────────────────────────────────────
  if (!exercise) return null

  const options = exercise.type === 'true_false'
    ? ['Verdadeiro', 'Falso']
    : (exercise.options ?? [])

  const progressPercent = Math.round((current / exercises.length) * 100)

  const DIFF_COLOR: Record<string, string> = {
    easy:   'text-green-600 bg-green-50 border-green-200',
    medium: 'text-amber-600 bg-amber-50 border-amber-200',
    hard:   'text-red-600   bg-red-50   border-red-200',
  }
  const DIFF_LABEL: Record<string, string> = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' }

  const currTierIcon  = ELO_TIER_ICONS[currentTier]
  const currTierLabel = ELO_TIER_LABELS[currentTier]
  const currDivLabel  = currentTier === 'mestre' ? '' : ` ${['', 'I', 'II', 'III', 'IV'][currentDivision] ?? currentDivision}`

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleExit}
            className="text-xs text-matema-muted hover:text-matema-dark transition-colors flex items-center gap-1"
            title={answers.length < MIN_QUESTIONS_TO_SAVE ? 'Sair sem salvar' : 'Salvar e sair'}
          >
            ✕ Sair
          </button>
          <span className="text-sm font-semibold text-matema-muted">
            {currTierIcon} {currTierLabel}{currDivLabel}
          </span>
        </div>
        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', DIFF_COLOR[exercise.difficulty])}>
          {DIFF_LABEL[exercise.difficulty]}
        </span>
      </div>

      {/* LP bar */}
      {currentTier !== 'mestre' && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-matema-muted mb-1">
            <span className="font-semibold">{currentLp} PDL</span>
            <span>100 PDL</span>
          </div>
          <div className="h-2 bg-matema-border rounded-full overflow-hidden">
            <div
              className="h-full bg-matema-primary/60 rounded-full transition-all"
              style={{ width: `${currentLp}%` }}
            />
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-matema-muted mb-1">
          <span>Questão {current + 1} de {exercises.length}</span>
          {phase === 'playing' && (
            <span className="tabular-nums">⏱️ {(elapsedMs / 1000).toFixed(1)}s</span>
          )}
        </div>
        <div className="h-2 bg-matema-border rounded-full overflow-hidden">
          <div
            className="h-full bg-matema-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-3xl border border-matema-border p-6 shadow-sm mb-4">
        {exercise.context && (
          <div className="bg-matema-cream rounded-2xl p-4 mb-4 border border-matema-border overflow-hidden">
            {exercise.context.trimStart().startsWith('<svg') ? (
              <div dangerouslySetInnerHTML={{ __html: exercise.context }} />
            ) : (
              <p className="text-sm text-matema-muted leading-relaxed">
                <MathText>{exercise.context}</MathText>
              </p>
            )}
          </div>
        )}

        <p className="font-semibold text-matema-dark text-base leading-relaxed mb-6">
          <MathText>{exercise.question}</MathText>
        </p>

        <div className="space-y-3">
          {options.map((option, i) => {
            const isSelected = selected === option
            const isCorrect = option.trim().toLowerCase() === exercise.correct_answer.trim().toLowerCase()
            let optClass = 'border-matema-border bg-white text-matema-dark hover:border-matema-primary hover:bg-matema-cream'

            if (phase === 'answered') {
              if (isCorrect) optClass = 'border-green-400 bg-green-50 text-green-800'
              else if (isSelected) optClass = 'border-red-400 bg-red-50 text-red-800'
              else optClass = 'border-matema-border bg-white text-matema-muted opacity-60'
            } else if (isSelected) {
              optClass = 'border-matema-primary bg-matema-primary/10 text-matema-primary'
            }

            return (
              <button
                key={`${exercise.id}-${i}`}
                onClick={() => handleSelect(option)}
                disabled={phase === 'answered'}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-2xl border-2 font-medium transition-all text-sm',
                  optClass,
                )}
              >
                <MathText>{option}</MathText>
              </button>
            )
          })}
        </div>
      </div>

      {phase === 'answered' && (
        <div className="animate-fade-in">
          <div className="bg-white rounded-2xl border border-matema-border p-4 mb-4 text-sm text-matema-muted leading-relaxed">
            <span className="font-semibold text-matema-dark">💡 </span>
            <MathText>{exercise.explanation}</MathText>
          </div>
          <button
            onClick={handleNext}
            className="w-full bg-matema-primary text-white font-bold py-4 rounded-2xl text-base hover:opacity-90 transition-opacity"
          >
            {current + 1 < exercises.length ? 'Próxima →' : 'Ver resultado 🏆'}
          </button>
        </div>
      )}
    </div>
  )
}
