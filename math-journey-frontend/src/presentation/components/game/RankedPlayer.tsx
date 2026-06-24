'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/presentation/lib/utils'
import { MathText } from '@/presentation/components/ui/MathText'
import { saveRankedGameAction, type RankedAnswer } from '@/app/actions/ranked'
import { ELO_TIER_LABELS, type EloTier } from '@/domain/user/entities/User'
import { EloTierIcon } from '@/presentation/components/ui/EloTierIcon'
import { RankedResultScreen } from '@/presentation/components/game/RankedResultScreen'
import { SimuladoReportScreen } from '@/presentation/components/game/SimuladoReportScreen'
import { LevelUpModal } from '@/presentation/components/game/LevelUpModal'
import {
  Settings,
  AlertTriangle,
  Lightbulb,
  Trophy,
  SkipForward,
  Clock,
} from 'lucide-react'

export interface RankedExercise {
  id: string
  question: string
  context: string | null
  type: 'multiple_choice' | 'true_false' | 'numeric'
  options: string[] | null
  correct_answer: string
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
  isSimulado?: boolean
}

type Phase = 'playing' | 'answered' | 'saving' | 'result'

const MIN_ANSWERED_TO_EXIT = 2
const SIMULADO_TOTAL_SECS  = 165 * 60   // 2h45
const SIMULADO_QUEST_MS    = 3 * 60 * 1000  // 3 min per question

function fmtCountdown(s: number): string {
  const h   = Math.floor(s / 3600)
  const m   = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export function RankedPlayer({
  exercises,
  difficulty,
  currentTier,
  currentDivision,
  currentLp,
  isSimulado = false,
}: RankedPlayerProps) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('playing')
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
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

  // Simulado: total countdown
  const [totalRemaining, setTotalRemaining] = useState(SIMULADO_TOTAL_SECS)
  const [timerExpired, setTimerExpired] = useState(false)
  const [answersSnapshot, setAnswersSnapshot] = useState<RankedAnswer[]>([])

  // Refs to hold latest answers/skipped for the timer auto-save
  const answersRef    = useRef<RankedAnswer[]>([])
  const skippedIdsRef = useRef<string[]>([])

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

  // ── Simulado: total countdown ──────────────────────────────────────────────
  useEffect(() => {
    if (!isSimulado) return
    const start = Date.now()
    let expired = false
    const iv = setInterval(() => {
      const remaining = Math.max(0, Math.floor((SIMULADO_TOTAL_SECS * 1000 - (Date.now() - start)) / 1000))
      setTotalRemaining(remaining)
      if (remaining === 0 && !expired) {
        expired = true
        clearInterval(iv)
        setTimerExpired(true)
      }
    }, 1000)
    return () => clearInterval(iv)
  }, [isSimulado])

  // ── Simulado: auto-save when time runs out ─────────────────────────────────
  useEffect(() => {
    if (!timerExpired || phase === 'saving' || phase === 'result') return
    saveGame(answersRef.current, skippedIdsRef.current)
  }, [timerExpired])  // eslint-disable-line react-hooks/exhaustive-deps

  // ── shared save helper ────────────────────────────────────────────────────
  const saveGame = useCallback(async (
    answersToSave: RankedAnswer[],
    skippedIdsArg: string[],
    earlyExitPenalty = false,
  ) => {
    setAnswersSnapshot(answersToSave)
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
    answersRef.current = newAnswers

    if (current + 1 < exercises.length) {
      setCurrent((c) => c + 1)
      setSelected(null)
      setPhase('playing')
    } else {
      await saveGame(newAnswers, skippedIds)
    }
  }, [selected, exercise, answers, current, exercises.length, skippedIds, saveGame])

  const handleSkip = useCallback(async () => {
    if (phase !== 'playing' || !exercise) return
    const newSkippedIds = [...skippedIds, exercise.id]
    setSkippedIds(newSkippedIds)
    skippedIdsRef.current = newSkippedIds

    if (current + 1 < exercises.length) {
      setCurrent((c) => c + 1)
      setSelected(null)
      setPhase('playing')
    } else {
      await saveGame(answers, newSkippedIds)
    }
  }, [phase, exercise, current, exercises.length, skippedIds, answers, saveGame])

  const handleExit = useCallback(() => {
    const exitAnswers: RankedAnswer[] = phase === 'answered' && selected && exercise
      ? [...answers, {
          exerciseId: exercise.id,
          answer: selected,
          isCorrect: selected.trim().toLowerCase() === exercise.correct_answer.trim().toLowerCase(),
          timeMs: Date.now() - questionStartRef.current,
        }]
      : answers

    if (exitAnswers.length < MIN_ANSWERED_TO_EXIT) {
      setShowExitWarning(true)
      return
    }

    saveGame(exitAnswers, skippedIds)
  }, [phase, selected, exercise, answers, skippedIds, saveGame])

  const confirmEarlyExit = useCallback(() => {
    setShowExitWarning(false)
    const exitAnswers: RankedAnswer[] = phase === 'answered' && selected && exercise
      ? [...answers, {
          exerciseId: exercise.id,
          answer: selected,
          isCorrect: selected.trim().toLowerCase() === exercise.correct_answer.trim().toLowerCase(),
          timeMs: Date.now() - questionStartRef.current,
        }]
      : answers
    saveGame(exitAnswers, skippedIds, true)
  }, [phase, selected, exercise, answers, skippedIds, saveGame])

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
        {isSimulado ? (
          <SimuladoReportScreen
            result={result}
            answers={answersSnapshot}
            exercises={exercises}
            onPlayAgain={() => router.push('/ranqueada/jogar')}
            onExit={() => router.push('/dashboard')}
          />
        ) : (
          <RankedResultScreen
            result={result}
            onPlayAgain={() => router.push('/ranqueada/jogar')}
            onExit={() => router.push('/dashboard')}
          />
        )}
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

  // Bar fill ratio for simulado per-question gauge
  const questBarPct = isSimulado ? Math.min(100, (elapsedMs / SIMULADO_QUEST_MS) * 100) : 0
  const questBarColor = elapsedMs < SIMULADO_QUEST_MS * 0.7
    ? 'bg-green-400'
    : elapsedMs < SIMULADO_QUEST_MS
    ? 'bg-amber-400'
    : 'bg-red-400'

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

      {/* Simulado: total countdown timer */}
      {isSimulado && (
        <div className={cn(
          'flex items-center justify-between mb-2 px-3 py-2 rounded-2xl border',
          totalRemaining < 600
            ? 'bg-red-50 border-red-200'
            : 'bg-matema-cream border-matema-border',
        )}>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-matema-muted">
            <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
            Tempo restante
          </span>
          <span className={cn(
            'text-sm font-extrabold tabular-nums',
            totalRemaining < 600 ? 'text-red-500' : 'text-matema-dark',
          )}>
            {fmtCountdown(totalRemaining)}
          </span>
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
          {phase === 'playing' && !isSimulado && (
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

      {/* Simulado: per-question suggested time bar */}
      {isSimulado && phase === 'playing' && (
        <div className="mb-1.5">
          <div className="flex justify-between text-xs mb-0.5">
            <span className="text-matema-muted">Sugerido: 3:00 / questão</span>
            {elapsedMs > SIMULADO_QUEST_MS && (
              <span className="text-amber-500 font-semibold">Acima do sugerido</span>
            )}
          </div>
          <div className="h-1.5 bg-matema-border rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', questBarColor)}
              style={{ width: `${questBarPct}%` }}
            />
          </div>
        </div>
      )}

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
              <p className="text-sm text-matema-muted leading-relaxed">
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
        <p className="font-semibold text-matema-dark text-sm leading-relaxed mb-3">
          <MathText>{exercise.question}</MathText>
        </p>

        <div className="space-y-2">
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
                  'w-full text-left px-4 py-2.5 rounded-2xl border-2 font-medium transition-all text-sm',
                  optClass,
                )}
              >
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
