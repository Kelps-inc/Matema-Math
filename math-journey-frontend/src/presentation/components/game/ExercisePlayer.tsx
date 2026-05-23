'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/presentation/components/ui/Button'
import { ProgressBar } from '@/presentation/components/ui/ProgressBar'
import { Badge } from '@/presentation/components/ui/Badge'
import { cn } from '@/presentation/lib/utils'
import { completeLessonAction } from '@/app/actions/progress'
import type { Exercise, Lesson } from '@/domain/learning/entities/Module'

interface ExercisePlayerProps {
  lesson: Lesson
  exercises: Exercise[]
}

type AnswerState = { exerciseId: string; answer: string; isCorrect: boolean }
type Phase = 'answering' | 'feedback' | 'completed'

export function ExercisePlayer({ lesson, exercises }: ExercisePlayerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('answering')
  const [answers, setAnswers] = useState<AnswerState[]>([])
  const [completionResult, setCompletionResult] = useState<{ newXp: number; newLevel: number; newCoins: number; leveledUp: boolean } | null>(null)

  const current = exercises[currentIndex]
  const isLast = currentIndex === exercises.length - 1
  const correctCount = answers.filter((a) => a.isCorrect).length

  function handleAnswer() {
    if (!selected || phase !== 'answering') return
    const isCorrect = current.isCorrect(selected)
    const answer: AnswerState = { exerciseId: current.id, answer: selected, isCorrect }
    setAnswers((prev) => [...prev, answer])
    setPhase('feedback')
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
        }
        setPhase('completed')
      })
    } else {
      setCurrentIndex((i) => i + 1)
      setSelected(null)
      setPhase('answering')
    }
  }

  if (phase === 'completed') {
    return (
      <CompletionScreen
        lesson={lesson}
        correctCount={correctCount}
        total={exercises.length}
        result={completionResult}
        onContinue={() => router.push('/modulos')}
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
              const isSelected = selected === option
              const isCorrectAnswer = phase === 'feedback' && option === current.correctAnswer
              const isWrong = phase === 'feedback' && isSelected && !current.isCorrect(option)

              return (
                <button
                  key={option}
                  onClick={() => phase === 'answering' && setSelected(option)}
                  disabled={phase === 'feedback'}
                  className={cn(
                    'w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 font-medium text-matema-dark',
                    phase === 'answering' && !isSelected && 'border-matema-border hover:border-matema-primary/50 hover:bg-matema-cream',
                    phase === 'answering' && isSelected && 'border-matema-primary bg-matema-primary/5',
                    isCorrectAnswer && 'border-green-500 bg-green-50 text-green-800',
                    isWrong && 'border-red-400 bg-red-50 text-red-800',
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className={cn(
                      'w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm flex-shrink-0',
                      phase === 'answering' && !isSelected && 'border-matema-border',
                      phase === 'answering' && isSelected && 'border-matema-primary bg-matema-primary text-white',
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
              const isSelected = selected === val
              const isCorrectAnswer = phase === 'feedback' && val === current.correctAnswer
              const isWrong = phase === 'feedback' && isSelected && val !== current.correctAnswer

              return (
                <button
                  key={val}
                  onClick={() => phase === 'answering' && setSelected(val)}
                  disabled={phase === 'feedback'}
                  className={cn(
                    'p-4 rounded-2xl border-2 font-semibold transition-all duration-200 text-center',
                    phase === 'answering' && !isSelected && 'border-matema-border hover:border-matema-primary/50 hover:bg-matema-cream text-matema-dark',
                    phase === 'answering' && isSelected && 'border-matema-primary bg-matema-primary/5 text-matema-primary',
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
          current.isCorrect(selected!) ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        )}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{current.isCorrect(selected!) ? '🎉' : '💡'}</span>
            <p className={cn('font-bold', current.isCorrect(selected!) ? 'text-green-800' : 'text-red-800')}>
              {current.isCorrect(selected!) ? 'Correto!' : 'Quase lá!'}
            </p>
          </div>
          <p className="text-sm text-matema-dark leading-relaxed">{current.explanation}</p>
        </div>
      )}

      <div className="flex gap-3">
        {phase === 'answering' ? (
          <Button
            onClick={handleAnswer}
            disabled={!selected}
            className="flex-1"
            size="lg"
          >
            Confirmar resposta
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            loading={isPending}
            className="flex-1"
            size="lg"
          >
            {isLast ? 'Concluir lição 🎓' : 'Próxima questão →'}
          </Button>
        )}
      </div>
    </div>
  )
}

function CompletionScreen({
  lesson,
  correctCount,
  total,
  result,
  onContinue,
}: {
  lesson: Lesson
  correctCount: number
  total: number
  result: { newXp: number; newLevel: number; newCoins: number; leveledUp: boolean } | null
  onContinue: () => void
}) {
  const percent = Math.round((correctCount / total) * 100)

  return (
    <div className="max-w-md mx-auto text-center py-8">
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

      <Button onClick={onContinue} size="lg" className="w-full">
        Ver todos os módulos
      </Button>
    </div>
  )
}
