'use client'

import { useState, useEffect, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { ClipboardList, Play, RotateCcw, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { deleteSimuladoSessionAction } from '@/app/actions/simulado'
import { SimuladoPlayer } from './SimuladoPlayer'
import type { RankedExercise } from './RankedPlayer'
import type { EloTier } from '@/domain/user/entities/User'

interface SavedSession {
  exerciseIds: string[]
  answers: Record<string, string>
  timeRemainingMs: number
}

interface Props {
  freshExercises: RankedExercise[]
  savedSession?: SavedSession
  savedExercises?: RankedExercise[]
  currentTier: EloTier
  currentDivision: number
  currentLp: number
}

export function SimuladoGate({
  freshExercises,
  savedSession,
  savedExercises,
  currentTier,
  currentDivision,
  currentLp,
}: Props) {
  const [choice, setChoice]          = useState<'none' | 'continue' | 'restart'>('none')
  const [isPending, startTransition] = useTransition()
  const [mounted, setMounted]        = useState(false)
  const router = useRouter()

  useEffect(() => { setMounted(true) }, [])

  const playerProps = { currentTier, currentDivision, currentLp }

  // No saved session → start fresh immediately
  if (!savedSession) {
    return <SimuladoPlayer exercises={freshExercises} {...playerProps} />
  }

  if (choice === 'continue') {
    return (
      <SimuladoPlayer
        exercises={savedExercises ?? freshExercises}
        initialAnswers={savedSession.answers}
        initialTimeRemainingMs={savedSession.timeRemainingMs}
        {...playerProps}
      />
    )
  }

  if (choice === 'restart') {
    return <SimuladoPlayer exercises={freshExercises} {...playerProps} />
  }

  const answered    = Object.keys(savedSession.answers).length
  const total       = savedSession.exerciseIds.length
  const remainSecs  = Math.floor(savedSession.timeRemainingMs / 1000)
  const h           = Math.floor(remainSecs / 3600)
  const m           = Math.floor((remainSecs % 3600) / 60)
  const timeLabel   = h > 0
    ? `${h}h${m.toString().padStart(2, '0')}min`
    : `${m}min`

  const modal = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] px-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl animate-fade-in">

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-5 h-5 text-amber-600" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-extrabold text-matema-dark">Simulado em andamento</p>
              <p className="text-xs text-matema-muted">Você tem um simulado salvo</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/ranqueada')}
            className="p-2 rounded-xl text-matema-muted hover:text-matema-dark hover:bg-matema-warm transition-colors"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="bg-matema-cream rounded-2xl p-3 mb-5 border border-matema-border flex justify-between text-sm">
          <span className="text-matema-muted">Respondidas</span>
          <span className="font-extrabold text-matema-dark">{answered} / {total}</span>
          <span className="text-matema-muted">Tempo restante</span>
          <span className="font-extrabold text-matema-dark">{timeLabel}</span>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => setChoice('continue')}
            className="w-full bg-matema-primary text-white font-bold py-3 rounded-2xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" strokeWidth={1.75} />
            Continuar de onde parei
          </button>
          <button
            onClick={() => startTransition(async () => {
              await deleteSimuladoSessionAction()
              setChoice('restart')
            })}
            disabled={isPending}
            className="w-full border-2 border-matema-border text-matema-dark font-bold py-3 rounded-2xl hover:bg-matema-warm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={1.75} />
            {isPending ? 'Aguarde…' : 'Recomeçar do zero'}
          </button>
        </div>

        <button
          onClick={() => router.push('/ranqueada')}
          className="mt-3 w-full text-matema-muted font-bold py-2.5 rounded-2xl hover:bg-matema-warm hover:text-matema-dark transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          Voltar à Ranqueada
        </button>

        <p className="mt-3 text-center text-[11px] text-matema-muted leading-relaxed">
          Recomeçar não custa PDL — você já pagou quando abandonou.
        </p>
      </div>
    </div>
  )

  // Portal para o body: escapa de ancestrais com transform (animate-fade-in),
  // garantindo que o fixed inset-0 ancore na viewport e centralize de verdade.
  if (!mounted) return null
  return createPortal(modal, document.body)
}
