'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/presentation/lib/utils'
import { MathText } from '@/presentation/components/ui/MathText'
import { savePlacementAction, type PlacementAnswer } from '@/app/actions/elo'
import { ELO_TIER_LABELS, type EloTier } from '@/domain/user/entities/User'
import { EloTierIcon } from '@/presentation/components/ui/EloTierIcon'
import { Settings, Lightbulb, Trophy } from 'lucide-react'

export interface PlacementQuestion {
  id: string
  question: string
  context: string | null
  type: 'multiple_choice' | 'true_false' | 'numeric'
  options: string[] | null
  correct_answer: string
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
}

interface PlacementPlayerProps {
  questions: PlacementQuestion[]
}

type Phase = 'intro' | 'playing' | 'answered' | 'calculating' | 'result'

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
}

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: 'text-green-600 bg-green-50 border-green-200',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  hard: 'text-red-600 bg-red-50 border-red-200',
}

export function PlacementPlayer({ questions }: PlacementPlayerProps) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('intro')
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answers, setAnswers] = useState<PlacementAnswer[]>([])
  const [elapsedMs, setElapsedMs] = useState(0)
  const [result, setResult] = useState<{
    tier: EloTier; division: number; score: number; accuracy: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const questionStartRef = useRef<number>(Date.now())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const question = questions[current]

  // Timer per question
  useEffect(() => {
    if (phase !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    questionStartRef.current = Date.now()
    setElapsedMs(0)
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - questionStartRef.current)
    }, 100)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase, current])

  const handleSelect = useCallback((option: string) => {
    if (phase !== 'playing') return
    setSelected(option)
    setPhase('answered')
    if (timerRef.current) clearInterval(timerRef.current)
  }, [phase])

  const handleNext = useCallback(async () => {
    if (!selected || !question) return

    const timeMs = Date.now() - questionStartRef.current
    const isCorrect = selected.trim().toLowerCase() === question.correct_answer.trim().toLowerCase()

    const newAnswers = [
      ...answers,
      { questionId: question.id, answer: selected, isCorrect, timeMs },
    ]
    setAnswers(newAnswers)

    if (current + 1 < questions.length) {
      setCurrent((c) => c + 1)
      setSelected(null)
      setPhase('playing')
    } else {
      // All done — save
      setPhase('calculating')
      const res = await savePlacementAction(newAnswers)
      if (res.error) {
        setError(res.error)
        return
      }
      setResult({
        tier: res.tier as EloTier,
        division: res.division!,
        score: res.score!,
        accuracy: res.accuracy!,
      })
      setPhase('result')
    }
  }, [selected, question, answers, current, questions.length])

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="max-w-xl mx-auto animate-fade-in">
        <div className="bg-white rounded-3xl border border-matema-border p-8 text-center shadow-sm">
          <div className="mb-4 flex justify-center">
            <Trophy className="w-16 h-16 text-yellow-500" strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-extrabold text-matema-dark mb-2">Teste de Classificação</h1>
          <p className="text-matema-muted mb-6 leading-relaxed">
            Responda <strong className="text-matema-dark">15 questões</strong> para descobrir seu elo inicial.
            Precisão e velocidade contam — mas não se preocupe, você pode melhorar depois!
          </p>

          <div className="grid grid-cols-3 gap-3 mb-8 text-sm">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-3">
              <div className="font-bold text-green-700 mb-1">4 questões</div>
              <div className="text-green-600">Fáceis</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
              <div className="font-bold text-amber-700 mb-1">6 questões</div>
              <div className="text-amber-600">Médias</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3">
              <div className="font-bold text-red-700 mb-1">5 questões</div>
              <div className="text-red-600">Difíceis</div>
            </div>
          </div>

          <div className="text-xs text-matema-muted mb-6 space-y-1">
            <p>Precisão tem peso de 95% na classificação</p>
            <p>Velocidade tem peso de 5% na classificação</p>
          </div>

          <button
            onClick={() => setPhase('playing')}
            className="w-full bg-matema-primary text-white font-bold py-4 rounded-2xl text-lg hover:opacity-90 transition-opacity"
          >
            Começar classificação!
          </button>
        </div>
      </div>
    )
  }

  // ── CALCULATING ────────────────────────────────────────────────────────────
  if (phase === 'calculating') {
    return (
      <div className="max-w-xl mx-auto animate-fade-in">
        <div className="bg-white rounded-3xl border border-matema-border p-12 text-center shadow-sm">
          <div className="mb-4 flex justify-center">
            <Settings className="w-12 h-12 text-matema-muted animate-spin" strokeWidth={1.75} style={{ display: 'inline-block' }} />
          </div>
          <h2 className="text-xl font-bold text-matema-dark mb-2">Calculando seu elo…</h2>
          <p className="text-matema-muted">Analisando precisão e velocidade das suas respostas</p>
          {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
        </div>
      </div>
    )
  }

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    const tierLabel = ELO_TIER_LABELS[result.tier]
    const divisionLabel = result.tier === 'mestre' ? '' : ` ${['', 'I', 'II', 'III', 'IV'][result.division] ?? result.division}`

    return (
      <div className="max-w-xl mx-auto animate-fade-in">
        <div className="bg-white rounded-3xl border border-matema-border p-8 text-center shadow-sm">
          <p className="text-matema-muted mb-2 text-sm font-medium uppercase tracking-wide">Seu elo inicial</p>
          <div className="mb-3 flex justify-center">
            <EloTierIcon tier={result.tier} size="w-20 h-20" />
          </div>
          <h2 className="text-3xl font-extrabold text-matema-dark mb-1">
            {tierLabel}{divisionLabel}
          </h2>
          <p className="text-matema-muted mb-4 text-sm">Pontuação geral: <strong className="text-matema-dark">{result.score}/100</strong></p>

          {/* PDL inicial */}
          {result.tier !== 'mestre' && (
            <div className="mb-6 max-w-xs mx-auto">
              <div className="flex justify-between text-xs text-matema-muted mb-1.5">
                <span className="font-semibold">0 PDL</span>
                <span>100 PDL para avançar</span>
              </div>
              <div className="h-2.5 bg-matema-border rounded-full overflow-hidden">
                <div className="h-full w-0 bg-matema-primary rounded-full" />
              </div>
              <p className="text-xs text-matema-muted mt-1.5">Jogue partidas ranqueadas para ganhar PDL e subir de divisão!</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-8 text-sm">
            <div className="bg-matema-cream border border-matema-border rounded-2xl p-4">
              <div className="text-2xl font-extrabold text-matema-dark">{result.accuracy}%</div>
              <div className="text-matema-muted">Precisão</div>
            </div>
            <div className="bg-matema-cream border border-matema-border rounded-2xl p-4">
              <div className="text-2xl font-extrabold text-matema-dark">
                {answers.filter((a) => a.isCorrect).length}/{questions.length}
              </div>
              <div className="text-matema-muted">Acertos</div>
            </div>
          </div>

          <button
            onClick={() => router.push('/ranqueada')}
            className="w-full bg-matema-primary text-white font-bold py-4 rounded-2xl text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            Ver minha classificação
            <Trophy className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    )
  }

  // ── PLAYING / ANSWERED ────────────────────────────────────────────────────
  if (!question) return null

  const options = question.type === 'true_false'
    ? ['Verdadeiro', 'Falso']
    : (question.options ?? [])

  const progressPercent = Math.round((current / questions.length) * 100)

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-matema-muted mb-2">
          <span>Questão {current + 1} de {questions.length}</span>
          <span className={cn(
            'font-semibold px-2 py-0.5 rounded-full border text-xs',
            DIFFICULTY_COLOR[question.difficulty],
          )}>
            {DIFFICULTY_LABEL[question.difficulty]}
          </span>
        </div>
        <div className="h-2 bg-matema-border rounded-full overflow-hidden">
          <div
            className="h-full bg-matema-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Timer */}
      {phase === 'playing' && (
        <div className="flex justify-end mb-3">
          <span className="text-xs text-matema-muted tabular-nums">
            {(elapsedMs / 1000).toFixed(1)}s
          </span>
        </div>
      )}

      {/* Question card */}
      <div className="bg-white rounded-3xl border border-matema-border p-6 shadow-sm mb-4">
        {/* Topic badge */}
        <div className="text-xs text-matema-muted font-medium mb-3 uppercase tracking-wide">
          {question.topic}
        </div>

        {/* Context */}
        {question.context && (
          <div className="bg-matema-cream rounded-2xl p-4 mb-4 border border-matema-border overflow-hidden">
            {question.context.trimStart().startsWith('<svg') ? (
              <div dangerouslySetInnerHTML={{ __html: question.context }} />
            ) : (
              <p className="text-sm text-matema-muted leading-relaxed">
                <MathText>{question.context}</MathText>
              </p>
            )}
          </div>
        )}

        {/* Question */}
        <p className="font-semibold text-matema-dark text-base leading-relaxed mb-6">
          <MathText>{question.question}</MathText>
        </p>

        {/* Options */}
        <div className="space-y-3">
          {options.map((option, i) => {
            const isSelected = selected === option
            const isCorrect = option.trim().toLowerCase() === question.correct_answer.trim().toLowerCase()
            let optClass = 'border-matema-border bg-white text-matema-dark hover:border-matema-primary hover:bg-matema-cream'

            if (phase === 'answered') {
              if (isCorrect) {
                optClass = 'border-green-400 bg-green-50 text-green-800'
              } else if (isSelected && !isCorrect) {
                optClass = 'border-red-400 bg-red-50 text-red-800'
              } else {
                optClass = 'border-matema-border bg-white text-matema-muted opacity-60'
              }
            } else if (isSelected) {
              optClass = 'border-matema-primary bg-matema-primary/10 text-matema-primary'
            }

            return (
              <button
                key={`${question.id}-${i}`}
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

      {/* Explanation + Next */}
      {phase === 'answered' && (
        <div className="animate-fade-in">
          <div className="bg-white rounded-2xl border border-matema-border p-4 mb-4 text-sm text-matema-muted leading-relaxed">
            <span className="inline-flex items-center gap-1 font-semibold text-matema-dark mr-1">
              <Lightbulb className="w-4 h-4 text-yellow-500" strokeWidth={1.75} />
              Explicação:
            </span>
            <MathText>{question.explanation}</MathText>
          </div>
          <button
            onClick={handleNext}
            className="w-full bg-matema-primary text-white font-bold py-4 rounded-2xl text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {current + 1 < questions.length ? 'Próxima questão →' : (
              <>
                Ver resultado
                <Trophy className="w-5 h-5" strokeWidth={1.75} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
