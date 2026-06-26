'use client'

import { useState, useEffect, useRef, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
// NOTE: abandonSimuladoAction no longer used here — handled by /api/simulado/abandon route
import { cn } from '@/presentation/lib/utils'
import { MathText } from '@/presentation/components/ui/MathText'
import { saveRankedGameAction, type RankedAnswer } from '@/app/actions/ranked'
import { upsertSimuladoSessionAction, deleteSimuladoSessionAction } from '@/app/actions/simulado'
import { ELO_TIER_LABELS, type EloTier } from '@/domain/user/entities/User'
import { EloTierIcon } from '@/presentation/components/ui/EloTierIcon'
import { SimuladoReportScreen } from '@/presentation/components/game/SimuladoReportScreen'
import { LevelUpModal } from '@/presentation/components/game/LevelUpModal'
import { AlertTriangle, Clock, Settings, Trophy } from 'lucide-react'
import type { RankedExercise } from './RankedPlayer'
import type { RankedResult } from './RankedResultScreen'

const TOTAL_SECS   = 165 * 60  // 2h45
const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E']

const DIFF_COLOR: Record<string, string> = {
  easy:   'text-green-600 bg-green-50   border-green-200',
  medium: 'text-amber-600 bg-amber-50   border-amber-200',
  hard:   'text-red-600   bg-red-50     border-red-200',
}
const DIFF_LABEL: Record<string, string> = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' }

function fmtCountdown(s: number): string {
  const h   = Math.floor(s / 3600)
  const m   = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  return `${m}:${sec.toString().padStart(2, '0')}`
}

interface Props {
  exercises: RankedExercise[]
  currentTier: EloTier
  currentDivision: number
  currentLp: number
  initialAnswers?: Record<string, string>
  initialTimeRemainingMs?: number
}

export function SimuladoPlayer({
  exercises,
  currentTier,
  currentDivision,
  currentLp,
  initialAnswers = {},
  initialTimeRemainingMs,
}: Props) {
  const router = useRouter()

  const [answers, setAnswers]             = useState<Record<string, string>>(initialAnswers)
  const [totalRemaining, setTotalRemaining] = useState(
    Math.floor((initialTimeRemainingMs ?? TOTAL_SECS * 1000) / 1000),
  )
  const [phase, setPhase]                 = useState<'playing' | 'confirm-abandon' | 'submitting' | 'result'>('playing')
  const [result, setResult]               = useState<RankedResult | null>(null)
  const [showLevelUp, setShowLevelUp]     = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [isPending, startTransition]      = useTransition()
  const questionRefs  = useRef<(HTMLDivElement | null)[]>([])
  const answersRef    = useRef(answers)
  const remainingRef  = useRef(totalRemaining)
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null)
  const saveTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => { answersRef.current = answers }, [answers])

  const stopTimers = useCallback(() => {
    if (timerRef.current)     clearInterval(timerRef.current)
    if (saveTimerRef.current) clearInterval(saveTimerRef.current)
  }, [])

  // Countdown
  useEffect(() => {
    if (phase !== 'playing') return
    timerRef.current = setInterval(() => {
      setTotalRemaining(prev => {
        const next = Math.max(0, prev - 1)
        remainingRef.current = next
        if (next === 0) {
          clearInterval(timerRef.current!)
          // Auto-submit when time runs out
          void (async () => {
            await deleteSimuladoSessionAction()
            const rankedAnswers = buildRankedAnswers(exercises, answersRef.current)
            const res = await saveRankedGameAction(rankedAnswers, { skippedExerciseIds: [] })
            if (!res.error) {
              const r = mapResult(res)
              if (r.leveledUp) setShowLevelUp(true)
              setResult(r)
              setPhase('result')
            }
          })()
        }
        return next
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase, exercises])

  // Auto-save every 30 s
  useEffect(() => {
    if (phase !== 'playing') return
    saveTimerRef.current = setInterval(() => {
      void upsertSimuladoSessionAction({
        exerciseIds:     exercises.map(e => e.id),
        answers:         answersRef.current,
        timeRemainingMs: remainingRef.current * 1000,
      })
    }, 30_000)
    return () => { if (saveTimerRef.current) clearInterval(saveTimerRef.current) }
  }, [phase, exercises])

  const handleAnswer = useCallback((exerciseId: string, option: string) => {
    setAnswers(prev => {
      const next = { ...prev, [exerciseId]: option }
      answersRef.current = next
      return next
    })
  }, [])

  const scrollTo = useCallback((idx: number) => {
    questionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleSubmit = useCallback(() => {
    stopTimers()
    setPhase('submitting')

    const rankedAnswers = buildRankedAnswers(exercises, answersRef.current)

    void (async () => {
      await deleteSimuladoSessionAction()
      const res = await saveRankedGameAction(rankedAnswers, { skippedExerciseIds: [] })
      if (res.error) { setError(res.error); setPhase('playing'); return }
      const r = mapResult(res)
      if (r.leveledUp) setShowLevelUp(true)
      setResult(r)
      setPhase('result')
    })()
  }, [exercises, stopTimers])

  const handleAbandon = useCallback(() => {
    stopTimers()
    setPhase('confirm-abandon')
  }, [stopTimers])

  const cancelAbandon = useCallback(() => {
    setPhase('playing')
  }, [])

  const confirmAbandon = useCallback(() => {
    // keepalive garante que o request completa mesmo após page unload
    fetch('/api/simulado/abandon', {
      method:    'POST',
      headers:   { 'Content-Type': 'application/json' },
      body:      JSON.stringify({
        exerciseIds:     exercises.map(e => e.id),
        answers:         answersRef.current,
        timeRemainingMs: remainingRef.current * 1000,
      }),
      keepalive: true,
    }).catch(() => {})
    window.location.href = '/ranqueada'
  }, [exercises])

  // ── SUBMITTING ──────────────────────────────────────────────────────────────
  if (phase === 'submitting') {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <Settings className="w-12 h-12 text-matema-muted animate-spin mx-auto mb-4" strokeWidth={1.75} />
        <p className="text-matema-muted">Calculando resultado…</p>
        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
      </div>
    )
  }

  // ── RESULT ──────────────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    const reportAnswers = buildRankedAnswers(exercises, answersRef.current)
    return (
      <>
        {showLevelUp && (
          <LevelUpModal
            newLevel={result.newLevel}
            newXp={result.newXp}
            onDismiss={() => setShowLevelUp(false)}
          />
        )}
        <SimuladoReportScreen
          result={result}
          answers={reportAnswers}
          exercises={exercises}
          onPlayAgain={() => router.push('/ranqueada/jogar')}
          onExit={() => router.push('/dashboard')}
        />
      </>
    )
  }

  const answeredCount = Object.keys(answers).length
  const currTierLabel = ELO_TIER_LABELS[currentTier]
  const currDivLabel  = currentTier === 'mestre'
    ? ''
    : ` ${['', 'I', 'II', 'III', 'IV'][currentDivision] ?? currentDivision}`

  return (
    <div className="animate-fade-in">

      {/* ── Abandon confirm modal ──────────────────────────────────────────── */}
      {phase === 'confirm-abandon' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] px-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" strokeWidth={1.75} />
              <p className="text-xl font-extrabold text-matema-dark">Abandonar simulado?</p>
            </div>
            <p className="text-sm text-matema-muted mb-1 leading-relaxed">
              Seu progresso será salvo. Você poderá continuar depois.
            </p>
            <p className="text-sm font-bold text-red-500 mb-5">
              O abandono custa <strong>−5 PDL</strong>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelAbandon}
                className="flex-1 border-2 border-matema-border py-2.5 rounded-2xl font-bold text-matema-dark hover:bg-matema-warm transition-colors text-sm"
              >
                Continuar prova
              </button>
              <button
                onClick={confirmAbandon}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-2xl font-bold hover:bg-red-600 transition-colors text-sm"
              >
                Abandonar (−5 PDL)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-matema-border -mx-4 px-4 py-2 mb-4 flex items-center gap-3">
        <div className={cn(
          'flex items-center gap-1.5 text-sm font-extrabold tabular-nums',
          totalRemaining < 600 ? 'text-red-500 animate-pulse' : 'text-matema-dark',
        )}>
          <Clock className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
          {fmtCountdown(totalRemaining)}
        </div>

        <div className="flex items-center gap-1 text-sm text-matema-muted">
          <EloTierIcon tier={currentTier} size="w-4 h-4" />
          <span className="font-semibold hidden sm:inline">{currTierLabel}{currDivLabel}</span>
          <span className="text-xs">· {currentLp} PDL</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-matema-muted hidden sm:inline">
            {answeredCount}/{exercises.length} respondidas
          </span>
          <button
            onClick={handleAbandon}
            className="text-xs font-semibold text-red-500 hover:text-red-600 px-3 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 transition-colors"
          >
            Abandonar
          </button>
        </div>
      </div>

      {/* ── Mobile: horizontal chip strip ─────────────────────────────────── */}
      <div className="lg:hidden flex gap-1.5 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
        {exercises.map((ex, i) => (
          <button
            key={ex.id}
            onClick={() => scrollTo(i)}
            className={cn(
              'flex-shrink-0 w-8 h-8 rounded-lg text-xs font-bold transition-colors',
              answers[ex.id]
                ? 'bg-matema-primary text-white'
                : 'bg-matema-cream text-matema-muted border border-matema-border hover:bg-matema-border',
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────────── */}
      <div className="flex gap-6 items-start">

        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-52 flex-shrink-0 sticky top-14">
          <div className="bg-white rounded-3xl border border-matema-border p-4 shadow-sm">
            <p className="text-[10px] font-bold text-matema-muted uppercase tracking-widest mb-3">Questões</p>
            <div className="grid grid-cols-5 gap-1 mb-3">
              {exercises.map((ex, i) => (
                <button
                  key={ex.id}
                  onClick={() => scrollTo(i)}
                  title={`Questão ${i + 1}${answers[ex.id] ? ' ✓' : ''}`}
                  className={cn(
                    'w-8 h-8 rounded-lg text-xs font-bold transition-colors',
                    answers[ex.id]
                      ? 'bg-matema-primary text-white'
                      : 'bg-matema-cream text-matema-muted hover:bg-matema-border',
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="border-t border-matema-border pt-3 mb-4 text-center">
              <span className="text-base font-extrabold text-matema-dark">{answeredCount}</span>
              <span className="text-xs text-matema-muted"> / {exercises.length} respondidas</span>
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-matema-primary text-white font-bold py-2.5 rounded-2xl text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" strokeWidth={1.75} />
              Entregar
            </button>
          </div>
        </aside>

        {/* Question list */}
        <div className="flex-1 min-w-0">
          <div className="space-y-5">
            {exercises.map((ex, i) => {
              const options  = ex.type === 'true_false' ? ['Verdadeiro', 'Falso'] : (ex.options ?? [])
              const selected = answers[ex.id] ?? null

              return (
                <div
                  key={ex.id}
                  ref={el => { questionRefs.current[i] = el }}
                  id={`q-${i + 1}`}
                  className="bg-white rounded-3xl border border-matema-border p-5 shadow-sm scroll-mt-16"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-matema-muted uppercase tracking-wide">
                        Questão {i + 1}
                      </span>
                      {ex.source && ex.source !== 'Matema' && (
                        <span className="text-[10px] text-matema-muted bg-matema-cream px-1.5 py-0.5 rounded-full border border-matema-border">
                          {ex.source}
                        </span>
                      )}
                    </div>
                    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', DIFF_COLOR[ex.difficulty])}>
                      {DIFF_LABEL[ex.difficulty]}
                    </span>
                  </div>

                  {/* Context */}
                  {ex.context && (
                    <div className="bg-matema-cream rounded-2xl p-3 mb-3 border border-matema-border overflow-hidden">
                      {ex.context.trimStart().startsWith('<svg') ? (
                        <div
                          className="[&_svg]:w-full [&_svg]:h-auto [&_svg]:block"
                          dangerouslySetInnerHTML={{ __html: ex.context }}
                        />
                      ) : (
                        <p className="text-sm text-matema-dark leading-relaxed" style={{ fontFamily: "var(--font-lora-var), Georgia, serif" }}>
                          <MathText>{ex.context}</MathText>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Question */}
                  <p className="font-semibold text-matema-dark text-sm leading-relaxed mb-4" style={{ fontFamily: "var(--font-lora-var), Georgia, serif" }}>
                    <MathText>{ex.question}</MathText>
                  </p>

                  {/* Options */}
                  <div className="space-y-2">
                    {options.map((option, j) => {
                      const letter     = OPTION_LETTERS[j] ?? String(j + 1)
                      const isSelected = selected === option

                      return (
                        <button
                          key={`${ex.id}-${j}`}
                          onClick={() => handleAnswer(ex.id, option)}
                          className={cn(
                            'w-full text-left px-4 py-2.5 rounded-2xl border-2 transition-all text-sm flex items-start gap-3',
                            isSelected
                              ? 'border-matema-primary bg-matema-primary/10 text-matema-primary'
                              : 'border-matema-border bg-white text-matema-dark hover:border-matema-primary/40 hover:bg-matema-cream',
                          )}
                        >
                          <span className={cn(
                            'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-extrabold mt-0.5',
                            isSelected
                              ? 'border-matema-primary bg-matema-primary text-white'
                              : 'border-matema-border text-matema-muted',
                          )}>
                            {letter}
                          </span>
                          <span className="font-medium leading-snug">
                            <MathText>{option}</MathText>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bottom submit */}
          <div className="mt-8 pb-10">
            <button
              onClick={handleSubmit}
              className="w-full bg-matema-primary text-white font-bold py-4 rounded-2xl text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Trophy className="w-5 h-5" strokeWidth={1.75} />
              Entregar Simulado · {answeredCount}/{exercises.length} respondidas
            </button>
            {answeredCount < exercises.length && (
              <p className="text-center text-xs text-matema-muted mt-2">
                Ainda há {exercises.length - answeredCount} questão{exercises.length - answeredCount !== 1 ? 'ões' : ''} sem resposta — você pode entregá-lo assim mesmo.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildRankedAnswers(
  exercises: RankedExercise[],
  answers: Record<string, string>,
): RankedAnswer[] {
  return exercises
    .filter(ex => answers[ex.id])
    .map(ex => ({
      exerciseId: ex.id,
      answer:     answers[ex.id],
      isCorrect:  answers[ex.id].trim().toLowerCase() === ex.correct_answer.trim().toLowerCase(),
      timeMs:     0,
    }))
}

function mapResult(res: Awaited<ReturnType<typeof saveRankedGameAction>>): RankedResult {
  return {
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
}
