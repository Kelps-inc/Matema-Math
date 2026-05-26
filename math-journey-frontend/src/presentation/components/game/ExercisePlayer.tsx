'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/presentation/components/ui/Button'
import { ProgressBar } from '@/presentation/components/ui/ProgressBar'
import { Badge } from '@/presentation/components/ui/Badge'
import { cn } from '@/presentation/lib/utils'
import { completeLessonAction } from '@/app/actions/progress'
import { createAudioContext, playSfxClick, playSfxCorrect, playSfxWrong } from '@/presentation/lib/audio'
import { MathText } from '@/presentation/components/ui/MathText'

export interface LessonDTO {
  id: string
  title: string
  description: string
  xpReward: number
  coinReward: number
  theory: string | null
}

export interface ExerciseDTO {
  id: string
  question: string
  context: string | null
  type: 'multiple_choice' | 'true_false' | 'numeric'
  options: string[] | null
  correctAnswer: string
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  orderIndex: number
}

interface ExercisePlayerProps {
  lesson: LessonDTO
  exercises: ExerciseDTO[]
  nextLesson: { id: string; title: string } | null
}

type AnswerState = { exerciseId: string; answer: string; isCorrect: boolean }
type Phase = 'intro' | 'answering' | 'feedback' | 'completed'

function isCorrect(exercise: ExerciseDTO, answer: string): boolean {
  return exercise.correctAnswer.trim().toLowerCase() === answer.trim().toLowerCase()
}

function useSfx() {
  const ctxRef = useRef<AudioContext | null>(null)
  function ctx() {
    if (!ctxRef.current) ctxRef.current = createAudioContext()
    if (ctxRef.current?.state === 'suspended') ctxRef.current.resume()
    return ctxRef.current
  }
  const enabled = () => typeof localStorage !== 'undefined' && localStorage.getItem('matema_sfx_enabled') !== 'false'
  const vol = () => {
    const v = parseFloat(localStorage.getItem('matema_sfx_volume') ?? '50')
    return (isNaN(v) ? 50 : v) / 100
  }
  return {
    click:   () => { const c = ctx(); if (c && enabled()) playSfxClick(c, vol()) },
    correct: () => { const c = ctx(); if (c && enabled()) playSfxCorrect(c, vol()) },
    wrong:   () => { const c = ctx(); if (c && enabled()) playSfxWrong(c, vol()) },
  }
}

export function ExercisePlayer({ lesson, exercises, nextLesson }: ExercisePlayerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const sfx = useSfx()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('intro')
  const [answers, setAnswers] = useState<AnswerState[]>([])
  const [completionResult, setCompletionResult] = useState<{ newXp: number; newLevel: number; newCoins: number; leveledUp: boolean } | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const current = exercises[currentIndex]
  const isLast = currentIndex === exercises.length - 1
  const correctCount = answers.filter((a) => a.isCorrect).length

  function handleAnswer() {
    if (!selected || phase !== 'answering') return
    const correct = isCorrect(current, selected)
    const answer: AnswerState = { exerciseId: current.id, answer: selected, isCorrect: correct }
    setAnswers((prev) => [...prev, answer])
    setPhase('feedback')
    if (correct) sfx.correct()
    else sfx.wrong()
  }

  function handleNext() {
    if (isLast) {
      const allAnswers = [...answers]
      startTransition(async () => {
        const result = await completeLessonAction({
          lessonId: lesson.id,
          xpReward: lesson.xpReward,
          coinReward: lesson.coinReward,
          answers: allAnswers,
        })
        if (result.success && result.result) {
          setCompletionResult(result.result)
          setPhase('completed')
        } else {
          setActionError(result.error ?? 'Erro desconhecido')
          setPhase('completed')
        }
      })
    } else {
      setCurrentIndex((i) => i + 1)
      setSelected(null)
      setPhase('answering')
    }
  }

  if (phase === 'intro') {
    return (
      <IntroScreen
        lesson={lesson}
        totalQuestions={exercises.length}
        onStart={() => setPhase('answering')}
      />
    )
  }

  if (phase === 'completed') {
    return (
      <CompletionScreen
        lesson={lesson}
        correctCount={correctCount}
        total={exercises.length}
        result={completionResult}
        error={actionError}
        nextLesson={nextLesson}
        onContinue={() => router.push('/modulos')}
        onNextLesson={nextLesson ? () => router.push(`/licao/${nextLesson.id}`) : undefined}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-matema-muted">
            Questão {currentIndex + 1} de {exercises.length}
          </span>
          <Badge variant={current.difficulty === 'easy' ? 'easy' : current.difficulty === 'medium' ? 'medium' : 'hard'}>
            {current.difficulty === 'easy' ? 'Fácil' : current.difficulty === 'medium' ? 'Médio' : 'Difícil'}
          </Badge>
        </div>
        <ProgressBar value={currentIndex} max={exercises.length} color="primary" />
      </div>

      <div className="bg-white rounded-3xl border border-matema-border p-6 md:p-8 mb-4">
        {current.context && (
          <div className="bg-matema-cream rounded-2xl p-4 mb-5 border border-matema-border">
            <p className="text-sm text-matema-muted leading-relaxed">{current.context}</p>
          </div>
        )}

        <h2 className="text-xl font-bold text-matema-dark mb-6 leading-snug">{current.question}</h2>

        {current.type === 'multiple_choice' && current.options && (
          <div className="grid gap-3">
            {current.options.map((option) => {
              const sel = selected === option
              const isCorrectAnswer = phase === 'feedback' && option === current.correctAnswer
              const isWrong = phase === 'feedback' && sel && option !== current.correctAnswer

              return (
                <button
                  key={option}
                  onClick={() => { if (phase === 'answering') { setSelected(option); sfx.click() } }}
                  disabled={phase === 'feedback'}
                  className={cn(
                    'w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 font-medium text-matema-dark',
                    phase === 'answering' && !sel && 'border-matema-border hover:border-matema-primary/50 hover:bg-matema-cream',
                    phase === 'answering' && sel && 'border-matema-primary bg-matema-primary/5',
                    isCorrectAnswer && 'border-green-500 bg-green-50 text-green-800',
                    isWrong && 'border-red-400 bg-red-50 text-red-800',
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className={cn(
                      'w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm flex-shrink-0',
                      phase === 'answering' && !sel && 'border-matema-border',
                      phase === 'answering' && sel && 'border-matema-primary bg-matema-primary text-white',
                      isCorrectAnswer && 'border-green-500 bg-green-500 text-white',
                      isWrong && 'border-red-400 bg-red-400 text-white',
                    )}>
                      {isCorrectAnswer ? '✓' : isWrong ? '✗' : ''}
                    </span>
                    {option}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {current.type === 'true_false' && (
          <div className="grid grid-cols-2 gap-3">
            {['true', 'false'].map((val) => {
              const label = val === 'true' ? 'Verdadeiro' : 'Falso'
              const sel = selected === val
              const isCorrectAnswer = phase === 'feedback' && val === current.correctAnswer
              const isWrong = phase === 'feedback' && sel && val !== current.correctAnswer

              return (
                <button
                  key={val}
                  onClick={() => { if (phase === 'answering') { setSelected(val); sfx.click() } }}
                  disabled={phase === 'feedback'}
                  className={cn(
                    'p-4 rounded-2xl border-2 font-semibold transition-all duration-200 text-center',
                    phase === 'answering' && !sel && 'border-matema-border hover:border-matema-primary/50 hover:bg-matema-cream text-matema-dark',
                    phase === 'answering' && sel && 'border-matema-primary bg-matema-primary/5 text-matema-primary',
                    isCorrectAnswer && 'border-green-500 bg-green-50 text-green-800',
                    isWrong && 'border-red-400 bg-red-50 text-red-800',
                  )}
                >
                  {label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {phase === 'feedback' && (
        <div className={cn(
          'rounded-2xl p-5 mb-4 border',
          isCorrect(current, selected!) ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        )}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{isCorrect(current, selected!) ? '🎉' : '💡'}</span>
            <p className={cn('font-bold', isCorrect(current, selected!) ? 'text-green-800' : 'text-red-800')}>
              {isCorrect(current, selected!) ? 'Correto!' : 'Quase lá!'}
            </p>
          </div>
          <p className="text-sm text-matema-dark leading-relaxed"><MathText>{current.explanation}</MathText></p>
        </div>
      )}

      <div className="flex gap-3">
        {phase === 'answering' ? (
          <Button onClick={handleAnswer} disabled={!selected} className="flex-1" size="lg">
            Confirmar resposta
          </Button>
        ) : (
          <Button onClick={handleNext} loading={isPending} className="flex-1" size="lg">
            {isLast ? 'Concluir lição 🎓' : 'Próxima questão →'}
          </Button>
        )}
      </div>
    </div>
  )
}

function IntroScreen({ lesson, totalQuestions, onStart }: {
  lesson: LessonDTO
  totalQuestions: number
  onStart: () => void
}) {
  return (
    <div className="max-w-2xl mx-auto py-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">📖</div>
        <h2 className="text-2xl font-bold text-matema-dark mb-1">{lesson.title}</h2>
        <p className="text-matema-muted leading-relaxed">{lesson.description}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-matema-cream rounded-2xl p-4 border border-matema-border text-center">
          <p className="text-xl font-bold text-matema-dark">{totalQuestions}</p>
          <p className="text-xs text-matema-muted mt-0.5">questões</p>
        </div>
        <div className="bg-matema-cream rounded-2xl p-4 border border-matema-border text-center">
          <p className="text-xl font-bold text-matema-primary">+{lesson.xpReward}</p>
          <p className="text-xs text-matema-muted mt-0.5">XP</p>
        </div>
        <div className="bg-matema-cream rounded-2xl p-4 border border-matema-border text-center">
          <p className="text-xl font-bold text-amber-600">+{lesson.coinReward}</p>
          <p className="text-xs text-matema-muted mt-0.5">moedas</p>
        </div>
      </div>

      {/* Texto explicativo */}
      {lesson.theory && (
        <div className="bg-white rounded-3xl border border-matema-border p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">💡</span>
            <h3 className="font-bold text-matema-dark">Entenda o conteúdo antes de começar</h3>
          </div>
          <div className="text-sm text-matema-dark leading-relaxed space-y-3">
            {lesson.theory.split('\n\n').map((block, i) => (
              <p key={i} className={block.startsWith('📌') ? 'font-semibold text-matema-dark mt-4' : 'text-matema-muted'}>
                <MathText>{block}</MathText>
              </p>
            ))}
          </div>
        </div>
      )}

      <Button onClick={onStart} size="lg" className="w-full">
        Começar lição 🚀
      </Button>
    </div>
  )
}

function CompletionScreen({
  lesson, correctCount, total, result, error, nextLesson, onContinue, onNextLesson,
}: {
  lesson: LessonDTO
  correctCount: number
  total: number
  result: { newXp: number; newLevel: number; newCoins: number; leveledUp: boolean } | null
  error: string | null
  nextLesson: { id: string; title: string } | null
  onContinue: () => void
  onNextLesson?: () => void
}) {
  const percent = Math.round((correctCount / total) * 100)

  return (
    <div className="max-w-md mx-auto text-center py-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-left">
          <p className="text-sm font-semibold text-red-800 mb-1">Erro ao salvar progresso</p>
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
      <div className="text-6xl mb-6">{percent >= 80 ? '🏆' : percent >= 60 ? '⭐' : '📚'}</div>

      <h2 className="text-2xl font-bold text-matema-dark mb-2">
        {percent >= 80 ? 'Incrível!' : percent >= 60 ? 'Bom trabalho!' : 'Continue praticando!'}
      </h2>
      <p className="text-matema-muted mb-6">
        Você acertou {correctCount} de {total} questões
      </p>

      {result?.leveledUp && (
        <div className="bg-matema-gold/15 border border-matema-gold/30 rounded-3xl p-5 mb-5">
          <p className="text-2xl mb-1">🎊</p>
          <p className="font-bold text-amber-800">Subiu para o Nível {result.newLevel}!</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-matema-cream rounded-2xl p-4 border border-matema-border">
          <p className="text-2xl font-bold text-matema-primary">+{lesson.xpReward}</p>
          <p className="text-sm text-matema-muted">XP ganho</p>
        </div>
        <div className="bg-matema-cream rounded-2xl p-4 border border-matema-border">
          <p className="text-2xl font-bold text-amber-600">+{lesson.coinReward}</p>
          <p className="text-sm text-matema-muted">Moedas</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {nextLesson && onNextLesson && (
          <Button onClick={onNextLesson} size="lg" className="w-full">
            Próxima lição: {nextLesson.title} →
          </Button>
        )}
        <button
          onClick={onContinue}
          className={cn(
            'w-full py-3 rounded-2xl text-sm font-semibold transition-colors',
            nextLesson
              ? 'text-matema-muted hover:text-matema-dark hover:bg-matema-border bg-matema-warm border border-matema-border'
              : 'bg-matema-primary text-white hover:opacity-90 font-bold text-base py-4 rounded-3xl',
          )}
        >
          Ver todos os módulos
        </button>
      </div>
    </div>
  )
}
