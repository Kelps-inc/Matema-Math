'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

export function LandingMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [visible, setVisible] = useState(false)
  const [fadeIn, setFadeIn] = useState(false)
  const startedRef = useRef(false)

  // Inicializa o elemento de áudio uma única vez
  useEffect(() => {
    const audio = new Audio('/sounds/tema-landing.wav')
    audio.loop = true
    audio.volume = 0
    audioRef.current = audio

    // Aparece o botão após 1.2s (landing já carregou visualmente)
    const showTimer = setTimeout(() => {
      setVisible(true)
      setTimeout(() => setFadeIn(true), 50)
    }, 1200)

    return () => {
      clearTimeout(showTimer)
      audio.pause()
      audio.src = ''
    }
  }, [])

  // Fade de volume suave
  const fadeVolume = useCallback((audio: HTMLAudioElement, target: number, duration = 1200) => {
    const steps = 40
    const interval = duration / steps
    const start = audio.volume
    const delta = (target - start) / steps
    let step = 0
    const timer = setInterval(() => {
      step++
      audio.volume = Math.max(0, Math.min(1, start + delta * step))
      if (step >= steps) clearInterval(timer)
    }, interval)
  }, [])

  const toggle = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return

    if (!playing) {
      // Primeira vez: precisa de user gesture para o browser permitir
      if (!startedRef.current) {
        audio.volume = 0
        await audio.play()
        startedRef.current = true
      } else {
        await audio.play()
      }
      fadeVolume(audio, 0.45)
      setPlaying(true)
    } else {
      fadeVolume(audio, 0, 600)
      setTimeout(() => audio.pause(), 620)
      setPlaying(false)
    }
  }, [playing, fadeVolume])

  if (!visible) return null

  return (
    <div
      className="fixed bottom-5 right-5 z-50 transition-all duration-700"
      style={{ opacity: fadeIn ? 1 : 0, transform: fadeIn ? 'translateY(0)' : 'translateY(12px)' }}
    >
      <button
        onClick={toggle}
        aria-label={playing ? 'Pausar música tema' : 'Tocar música tema'}
        title={playing ? 'Pausar música tema' : 'Tocar música tema'}
        className="relative flex items-center justify-center w-11 h-11 rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-matema-primary"
        style={{
          background: playing
            ? 'linear-gradient(135deg,#D4845A,#8B7CC4)'
            : 'rgba(255,255,255,0.92)',
          border: playing ? 'none' : '1.5px solid #E8E0D4',
        }}
      >
        {/* Anel pulsante quando tocando */}
        {playing && (
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: 'linear-gradient(135deg,#D4845A50,#8B7CC450)', animationDuration: '1.8s' }}
          />
        )}
        {playing
          ? <Volume2 className="w-5 h-5 text-white relative z-10" strokeWidth={1.75} />
          : <VolumeX className="w-5 h-5 relative z-10" style={{ color: '#9E8F88' }} strokeWidth={1.75} />
        }
      </button>

      {/* Tooltip */}
      <span
        className="absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap text-xs font-semibold px-2.5 py-1 rounded-lg shadow pointer-events-none transition-opacity duration-300"
        style={{
          background: 'rgba(255,255,255,0.95)',
          border: '1px solid #E8E0D4',
          color: '#6B5F58',
          opacity: playing ? 0 : 1,
        }}
      >
        ♪ Música tema
      </span>
    </div>
  )
}
