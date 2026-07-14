'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ClipboardList, Play, RotateCcw, ArrowLeft, History } from 'lucide-react'
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
  const [choice, setChoice]          = useState<'landing' | 'play-saved' | 'play-fresh'>('landing')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const playerProps = { currentTier, currentDivision, currentLp }

  if (choice === 'play-saved' && savedSession) {
    return (
      <SimuladoPlayer
        exercises={savedExercises ?? freshExercises}
        initialAnswers={savedSession.answers}
        initialTimeRemainingMs={savedSession.timeRemainingMs}
        {...playerProps}
      />
    )
  }

  if (choice === 'play-fresh') {
    return <SimuladoPlayer exercises={freshExercises} {...playerProps} />
  }

  // ── Landing: sempre exibida ao entrar em /ranqueada/jogar/simulado ────────
  const answered   = savedSession ? Object.keys(savedSession.answers).length : 0
  const total      = savedSession?.exerciseIds.length ?? 0
  const remainSecs = savedSession ? Math.floor(savedSession.timeRemainingMs / 1000) : 0
  const h          = Math.floor(remainSecs / 3600)
  const m          = Math.floor((remainSecs % 3600) / 60)
  const timeLabel  = h > 0 ? `${h}h${m.toString().padStart(2, '0')}min` : `${m}min`

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <Link href="/ranqueada/jogar" className="inline-flex items-center gap-1 text-sm text-matema-muted hover:text-matema-dark transition-colors mb-6">
        ← Escolher modo
      </Link>

      <div className="bg-white rounded-3xl border border-matema-border p-6 text-center shadow-sm">
        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <ClipboardList className="w-7 h-7 text-amber-600" strokeWidth={1.75} />
        </div>

        {savedSession ? (
          <>
            <h1 className="text-lg font-extrabold text-matema-dark mb-1">Simulado em andamento</h1>
            <p className="text-sm text-matema-muted mb-5">Você tem um simulado salvo.</p>

            <div className="bg-matema-cream rounded-2xl p-3 mb-5 border border-matema-border flex justify-between text-sm">
              <span className="text-matema-muted">Respondidas</span>
              <span className="font-extrabold text-matema-dark">{answered} / {total}</span>
              <span className="text-matema-muted">Tempo restante</span>
              <span className="font-extrabold text-matema-dark">{timeLabel}</span>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setChoice('play-saved')}
                className="w-full bg-matema-primary text-white font-bold py-3 rounded-2xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" strokeWidth={1.75} />
                Continuar de onde parei
              </button>
              <button
                onClick={() => startTransition(async () => {
                  await deleteSimuladoSessionAction()
                  setChoice('play-fresh')
                })}
                disabled={isPending}
                className="w-full border-2 border-matema-border text-matema-dark font-bold py-3 rounded-2xl hover:bg-matema-warm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <RotateCcw className="w-4 h-4" strokeWidth={1.75} />
                {isPending ? 'Aguarde…' : 'Recomeçar do zero'}
              </button>
            </div>

            <p className="mt-3 text-center text-[11px] text-matema-muted leading-relaxed">
              Recomeçar não custa PDL — você já pagou quando abandonou.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-lg font-extrabold text-matema-dark mb-1">Simulado ENEM</h1>
            <p className="text-sm text-matema-muted mb-5">45 questões estilo ENEM · cronômetro de 2h45.</p>

            <button
              onClick={() => setChoice('play-fresh')}
              className="w-full bg-amber-500 text-white font-bold py-3 rounded-2xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" strokeWidth={1.75} />
              Iniciar simulado
            </button>
          </>
        )}

        <div className="border-t border-matema-border mt-5 pt-3 flex flex-col gap-1">
          <Link
            href="/ranqueada/simulados"
            className="w-full text-matema-dark font-semibold py-2.5 rounded-2xl hover:bg-matema-warm transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <History className="w-4 h-4" strokeWidth={1.75} />
            Ver histórico
          </Link>
          <button
            onClick={() => router.push('/ranqueada')}
            className="w-full text-matema-muted font-bold py-2 rounded-2xl hover:bg-matema-warm hover:text-matema-dark transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            Voltar à Ranqueada
          </button>
        </div>
      </div>
    </div>
  )
}
