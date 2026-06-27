'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/presentation/lib/utils'
import { MathText } from '@/presentation/components/ui/MathText'
import { saveRankedGameAction, type RankedAnswer } from '@/app/actions/ranked'
import { checkExerciseAnswerAction } from '@/app/actions/answers'
import { ELO_TIER_LABELS, type EloTier } from '@/domain/user/entities/User'
import { EloTierIcon } from '@/presentation/components/ui/EloTierIcon'
import { RankedResultScreen } from '@/presentation/components/game/RankedResultScreen'
import { LevelUpModal } from '@/presentation/components/game/LevelUpModal'
import {
  Settings,
  AlertTriangle,
  Lightbulb,
  Trophy,
  SkipForward,
} from 'lucide-react'

export interface RankedExercise {
  id: string
  question: string
  context: string | null
  type: 'multiple_choice' | 'true_false' | 'numeric'
  options: string[] | null
  // O gabarito NÃO é enviado nos modos objetivas/enem (RankedPlayer valida no
  // servidor via checkExerciseAnswerAction). O modo Simulado ainda o carrega
  // para feedback imediato no cliente — mas a pontuação é sempre revalidada no
  // servidor em saveRankedGameAction.
  correct_answer?: string
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  source?: string | null
}

interface RankedPlayerProps {
  exercises: RankedExercise[]
  difficulty: string
  currentTier: EloTier
  currentDivision: number
  currentLp: number
  useSerif?: boolean
}

type Phase = 'playing' | 'answered' | 'saving' | 'result'

const MIN_ANSWERED_TO_EXIT = 2 // fewer than this triggers the -2 PDL warning
const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E']

export function RankedPlayer({ exercises, difficulty, currentTier, currentDivision, currentLp, useSerif = false }: RankedPlayerProps) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('playing')
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState<{ isCorrect: boolean; correctAnswer: string } | null>(null)
  const [answeredTimeMs, setAnsweredTimeMs] = useState(0)
  const [answers, setAnswers] = useState<RankedAnswer[]>([])
  const [skippedIds, setSkippedIds] = useState<string[]>([])
  const [showExitWarning, setShowExitWarning] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [result, setResult] = useState<{
    score: number; accuracy: number; correct: number; total: number
    lpChange: number; newLp: number; newTier: EloTier; newDivision: number
    promoted: boolean; demoted: boolean
    xpEarned: number; coinsEarned: number; newXp: number; newLevel: number; leveledUp: boolean
  } | null>(null)
  const [showLevelUp, setShowLevelUp] = useState(false)
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

  // ── shared save helper ────────────────────────────────────────────────────
  const saveGame = useCallback(async (
    answersToSave: RankedAnswer[],
    skippedIdsArg: string[],
    earlyExitPenalty = false,
  ) => {
    setPhase('saving')
    const res = await saveRankedGameAction(answersToSave, { skippedExerciseIds: skippedIdsArg, earlyExitPenalty })
    if (res.error) { setError(res.error); return }
    const r = {
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
      xpEarned:    res.xpEarned!,
      coinsEarned: res.coinsEarned!,
      newXp:       res.newXp!,
      newLevel:    res.newLevel!,
      leveledUp:   res.leveledUp!,
    }
    if (r.leveledUp) setShowLevelUp(true)
    setResult(r)
    setPhase('result')
  }, [])

  const handleSelect = useCallback(async (option: string) => {
    if (phase !== 'playing' || !exercise) return
    const timeMs = Date.now() - questionStartRef.current
    if (timerRef.current) clearInterval(timerRef.current)
    setAnsweredTimeMs(timeMs)
    setSelected(option)
    setPhase('answered')
    // O gabarito não vem ao cliente: validamos no servidor e revelamos o veredito.
    const res = await checkExerciseAnswerAction(exercise.id, option)
    if ('error' in res) setError(res.error)
    else setRevealed(res)
  }, [phase, exercise])

  const handleNext = useCallback(async () => {
    if (!selected || !exercise) return

    const isCorrect = revealed?.isCorrect ?? false
    const newAnswers: RankedAnswer[] = [
      ...answers,
      { exerciseId: exercise.id, answer: selected, isCorrect, timeMs: answeredTimeMs },
    ]
    setAnswers(newAnswers)

    if (current + 1 < exercises.length) {
      setCurrent((c) => c + 1)
      setSelected(null)
      setRevealed(null)
      setPhase('playing')
    } else {
      await saveGame(newAnswers, skippedIds)
    }
  }, [selected, exercise, revealed, answeredTimeMs, answers, current, exercises.length, skippedIds, saveGame])

  const handleSkip = useCallback(async () => {
    if (phase !== 'playing' || !exercise) return
    const newSkippedIds = [...skippedIds, exercise.id]
    setSkippedIds(newSkippedIds)

    if (current + 1 < exercises.length) {
      setCurrent((c) => c + 1)
      setSelected(null)
      setPhase('playing')
    } else {
      // Skipped last question — save what we have
      await saveGame(answers, newSkippedIds)
    }
  }, [phase, exercise, current, exercises.length, skippedIds, answers, saveGame])

  const handleExit = useCallback(() => {
    const answeredCount = answers.length + (phase === 'answered' ? 1 : 0)
    // Note: we count what's already in state; current question answered but not committed is counted
    const exitAnswers: RankedAnswer[] = phase === 'answered' && selected && exercise
      ? [...answers, {
          exerciseId: exercise.id,
          answer: selected,
          isCorrect: revealed?.isCorrect ?? false,
          timeMs: answeredTimeMs,
        }]
      : answers

    if (exitAnswers.length < MIN_ANSWERED_TO_EXIT) {
      setShowExitWarning(true)
      return
    }

    saveGame(exitAnswers, skippedIds)
  }, [phase, selected, exercise, revealed, answeredTimeMs, answers, skippedIds, saveGame])

  const confirmEarlyExit = useCallback(() => {
    setShowExitWarning(false)
    const exitAnswers: RankedAnswer[] = phase === 'answered' && selected && exercise
      ? [...answers, {
          exerciseId: exercise.id,
          answer: selected,
          isCorrect: revealed?.isCorrect ?? false,
          timeMs: answeredTimeMs,
        }]
      : answers
    saveGame(exitAnswers, skippedIds, true)
  }, [phase, selected, exercise, revealed, answeredTimeMs, answers, skippedIds, saveGame])

  // ── SAVING ─────────────────────────────────────────────────────────────────
  if (phase === 'saving') {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <div className="mb-4 flex justify-center">
          <Settings className="w-12 h-12 text-matema-muted animate-spin" strokeWidth={1.75} />
        </div>
        <p className="text-matema-muted">Calculando resultado…</p>
        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
      </div>
    )
  }

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    return (
      <>
        {showLevelUp && (
          <LevelUpModal
            newLevel={result.newLevel}
            newXp={result.newXp}
            onDismiss={() => setShowLevelUp(false)}
          />
        )}
        <RankedResultScreen
          result={result}
          onPlayAgain={() => router.push('/ranqueada/jogar')}
          onExit={() => router.push('/dashboard')}
        />
      </>
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

  const currTierLabel = ELO_TIER_LABELS[currentTier]
  const currDivLabel  = currentTier === 'mestre' ? '' : ` ${['', 'I', 'II', 'III', 'IV'][currentDivision] ?? currentDivision}`

  // suppress unused warning for difficulty prop (still in interface for page compatibility)
  void difficulty

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      {/* Warning modal — sair cedo */}
      {showExitWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" strokeWidth={1.75} />
              <p className="text-xl font-extrabold text-matema-dark">Saindo cedo</p>
            </div>
            <p className="text-sm text-matema-muted mb-5 leading-relaxed">
              Você respondeu apenas <strong>{answers.length}</strong> quest{answers.length === 1 ? 'ão' : 'ões'}.
              Encerrar agora custará <strong className="text-red-500">−2 PDL</strong>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitWarning(false)}
                className="flex-1 border-2 border-matema-border py-2.5 rounded-2xl font-bold text-matema-dark hover:bg-matema-warm transition-colors text-sm"
              >
                Continuar
              </button>
              <button
                onClick={confirmEarlyExit}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-2xl font-bold hover:bg-red-600 transition-colors text-sm"
              >
                Sair (−2 PDL)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tier + dificuldade */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-matema-muted">
          <EloTierIcon tier={currentTier} size="w-4 h-4" />
          {currTierLabel}{currDivLabel}
        </span>
        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', DIFF_COLOR[exercise.difficulty])}>
          {DIFF_LABEL[exercise.difficulty]}
        </span>
      </div>

      {/* LP bar */}
      {currentTier !== 'mestre' && (
        <div className="mb-1.5">
          <div className="text-xs text-matema-muted mb-0.5">
            <span className="font-semibold">{currentLp} PDL</span>
          </div>
          <div className="h-1.5 bg-matema-border rounded-full overflow-hidden">
            <div
              className="h-full bg-matema-primary/60 rounded-full transition-all"
              style={{ width: `${currentLp}%` }}
            />
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="mb-1">
        <div className="flex justify-between text-xs text-matema-muted mb-0.5">
          <span>Questão {current + 1} de {exercises.length}</span>
          {phase === 'playing' && (
            <span className="tabular-nums">{(elapsedMs / 1000).toFixed(1)}s</span>
          )}
        </div>
        <div className="h-1.5 bg-matema-border rounded-full overflow-hidden">
          <div
            className="h-full bg-matema-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-3xl border border-matema-border p-4 shadow-sm mb-2">
        {exercise.context && (
          <div className="bg-matema-cream rounded-2xl p-3 mb-3 border border-matema-border overflow-hidden">
            {exercise.context.trimStart().startsWith('<svg') ? (
              <div
                className="[&_svg]:w-full [&_svg]:h-auto [&_svg]:block"
                dangerouslySetInnerHTML={{ __html: exercise.context }}
              />
            ) : (
              <p className="text-sm text-matema-muted leading-relaxed" style={useSerif ? { fontFamily: "var(--font-lora-var), Georgia, serif" } : undefined}>
                <MathText>{exercise.context}</MathText>
              </p>
            )}
          </div>
        )}

        {exercise.source && (
          <p className="text-xs text-matema-muted mb-1">
            {exercise.source === 'Matema' ? 'Original Matema' : exercise.source}
          </p>
        )}
        <p className="font-semibold text-matema-dark text-sm leading-relaxed mb-3" style={useSerif ? { fontFamily: "var(--font-lora-var), Georgia, serif" } : undefined}>
          <MathText>{exercise.question}</MathText>
        </p>

        <div className="space-y-2">
          {options.map((option, i) => {
            const letter     = OPTION_LETTERS[i] ?? String(i + 1)
            const isSelected = selected === option
            const isCorrect  = revealed != null && option.trim().toLowerCase() === revealed.correctAnswer.trim().toLowerCase()

            let optClass    = 'border-matema-border bg-white text-matema-dark hover:border-matema-primary hover:bg-matema-cream'
            let letterClass = 'border-matema-border text-matema-muted'

            if (phase === 'answered') {
              if (isCorrect) {
                optClass    = 'border-green-400 bg-green-50 text-green-800'
                letterClass = 'border-green-400 bg-green-400 text-white'
              } else if (isSelected) {
                optClass    = 'border-red-400 bg-red-50 text-red-800'
                letterClass = 'border-red-400 bg-red-400 text-white'
              } else {
                optClass    = 'border-matema-border bg-white text-matema-muted opacity-60'
                letterClass = 'border-matema-border text-matema-muted'
              }
            } else if (isSelected) {
              optClass    = 'border-matema-primary bg-matema-primary/10 text-matema-primary'
              letterClass = 'border-matema-primary bg-matema-primary text-white'
            }

            return (
              <button
                key={`${exercise.id}-${i}`}
                onClick={() => handleSelect(option)}
                disabled={phase === 'answered'}
                className={cn(
                  'w-full text-left px-4 py-2.5 rounded-2xl border-2 font-medium transition-all text-sm flex items-start gap-3',
                  optClass,
                )}
              >
                <span className={cn(
                  'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-extrabold mt-0.5 transition-all',
                  letterClass,
                )}>
                  {letter}
                </span>
                <MathText>{option}</MathText>
              </button>
            )
          })}
        </div>
      </div>

      {/* Answered: explicação + próxima */}
      {phase === 'answered' && (
        <div className="animate-fade-in mb-2">
          <div className="bg-white rounded-2xl border border-matema-border p-3 mb-2 text-sm text-matema-muted leading-relaxed">
            <span className="inline-flex items-center gap-1 font-semibold text-matema-dark mr-1">
              <Lightbulb className="w-4 h-4 text-yellow-500" strokeWidth={1.75} />
            </span>
            <MathText>{exercise.explanation}</MathText>
          </div>
          <button
            onClick={handleNext}
            className="w-full bg-matema-primary text-white font-bold py-3 rounded-2xl text-sm hover:opacity-90 transition-opacity"
          >
            {current + 1 < exercises.length ? 'Próxima →' : (
              <span className="flex items-center justify-center gap-2">
                Ver resultado
                <Trophy className="w-4 h-4" strokeWidth={1.75} />
              </span>
            )}
          </button>
        </div>
      )}

      {/* Playing: Pular questão */}
      {phase === 'playing' && (
        <div className="flex justify-center mb-1">
          <button
            onClick={handleSkip}
            className="flex items-center gap-1.5 text-xs text-matema-muted hover:text-amber-600 px-4 py-1.5 rounded-xl hover:bg-amber-50 transition-colors"
          >
            <SkipForward className="w-4 h-4" strokeWidth={1.75} />
            Pular questão <span className="opacity-60">(−1 PDL)</span>
          </button>
        </div>
      )}

      {/* Encerrar gameplay — sempre no rodapé */}
      <div className="flex justify-center mt-1">
        <button
          onClick={handleExit}
          className="text-sm font-semibold text-matema-muted hover:text-red-500 px-5 py-2 rounded-xl border border-matema-border hover:border-red-300 hover:bg-red-50 transition-colors"
        >
          Encerrar gameplay
        </button>
      </div>
    </div>
  )
}
