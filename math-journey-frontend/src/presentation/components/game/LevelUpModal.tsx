'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createAudioContext, playSfxLevelUp } from '@/presentation/lib/audio'

interface LevelUpModalProps {
  newLevel: number
  newXp: number
  onDismiss: () => void
}

const CONFETTI_COLORS = [
  '#6366f1', '#f97316', '#22c55e', '#eab308',
  '#ec4899', '#06b6d4', '#a855f7', '#ef4444',
]

function xpFloorForLevel(level: number) { return Math.pow(level - 1, 2) * 50 }
function xpCeilForLevel(level: number)  { return Math.pow(level, 2) * 50 }

export function LevelUpModal({ newLevel, newXp, onDismiss }: LevelUpModalProps) {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const [barWidth, setBarWidth] = useState(0)

  const xpFloor   = xpFloorForLevel(newLevel)
  const xpCeil    = xpCeilForLevel(newLevel)
  const xpInLevel = newXp - xpFloor
  const xpNeeded  = xpCeil - xpFloor
  const xpToNext  = xpCeil - newXp
  const percent   = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100))

  // Play sound + animate bar on mount
  useEffect(() => {
    const sfxEnabled = typeof localStorage !== 'undefined'
      && localStorage.getItem('matema_sfx_enabled') !== 'false'

    if (sfxEnabled) {
      if (!audioCtxRef.current) audioCtxRef.current = createAudioContext()
      const c = audioCtxRef.current
      if (c) {
        if (c.state === 'suspended') c.resume()
        const rawVol = parseFloat(localStorage.getItem('matema_sfx_volume') ?? '50')
        const vol = (isNaN(rawVol) ? 50 : rawVol) / 100
        playSfxLevelUp(c, vol)
      }
    }

    // Animate bar after a short delay so the transition is visible
    const t = setTimeout(() => setBarWidth(percent), 350)
    return () => clearTimeout(t)
  }, [percent])

  // Dismiss on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onDismiss])

  const confettiPieces = useMemo(() =>
    Array.from({ length: 72 }, (_, i) => ({
      id: i,
      left:    Math.random() * 100,
      color:   CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      width:   4 + Math.random() * 7,
      height:  6 + Math.random() * 9,
      delay:   Math.random() * 1.4,
      dur:     1.8 + Math.random() * 2.2,
      rot:     Math.random() * 360,
    })),
    [],
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onDismiss}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />

      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confettiPieces.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.left}%`,
              top: '-12px',
              width:  `${p.width}px`,
              height: `${p.height}px`,
              backgroundColor: p.color,
              borderRadius: '2px',
              transform: `rotate(${p.rot}deg)`,
              animation: `confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        className="relative z-10 bg-white rounded-3xl px-8 py-10 text-center shadow-2xl w-full max-w-sm mx-4"
        style={{ animation: 'levelUpPop 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Arrow up badge */}
        <div className="flex justify-center mb-3">
          <span className="text-5xl" style={{ animation: 'levelNumPulse 0.7s 0.5s ease-out both' }}>
            ⬆️
          </span>
        </div>

        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-matema-muted mb-1">
          Subiu de nível!
        </p>

        {/* Level number */}
        <div
          className="text-8xl font-extrabold leading-none mb-1"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'levelNumPulse 0.6s 0.6s ease-out both',
          }}
        >
          {newLevel}
        </div>
        <p className="text-sm font-semibold text-matema-muted mb-7">Nível atual</p>

        {/* XP bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-matema-muted mb-1.5">
            <span>{xpInLevel} XP</span>
            <span>{xpNeeded} XP</span>
          </div>

          <div className="h-3 bg-matema-warm rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${barWidth}%`,
                background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                transition: 'width 1.1s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          </div>

          <p className="text-xs text-matema-muted mt-2">
            Faltam{' '}
            <span className="font-bold text-matema-dark">{xpToNext} XP</span>
            {' '}para o Nível {newLevel + 1}
          </p>
        </div>

        <button
          onClick={onDismiss}
          className="w-full py-3.5 rounded-2xl font-bold text-white text-base transition-opacity hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
        >
          Continuar 🎉
        </button>
      </div>
    </div>
  )
}
