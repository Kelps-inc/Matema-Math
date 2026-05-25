'use client'

import { useEffect, useRef } from 'react'
import { createAudioContext, startAmbientMusic } from '@/presentation/lib/audio'

type MusicHandle = { stop: () => void; setVolume: (v: number) => void }

function getVol() {
  const v = parseFloat(localStorage.getItem('matema_music_volume') ?? '50')
  return (isNaN(v) ? 50 : v) / 100
}

export function AudioManager() {
  const ctxRef    = useRef<AudioContext | null>(null)
  const handleRef = useRef<MusicHandle | null>(null)

  useEffect(() => {
    const enabled = localStorage.getItem('matema_music_enabled') === 'true'
    if (enabled) startMusic()

    function startMusic() {
      if (!ctxRef.current) ctxRef.current = createAudioContext()
      const ctx = ctxRef.current
      if (!ctx) return
      if (ctx.state === 'suspended') ctx.resume()
      handleRef.current?.stop()
      handleRef.current = startAmbientMusic(ctx, getVol())
    }

    function stopMusic() {
      handleRef.current?.stop()
      handleRef.current = null
    }

    function handleToggle(e: Event) {
      const detail = (e as CustomEvent<{ enabled: boolean }>).detail
      if (detail.enabled) startMusic()
      else stopMusic()
    }

    function handleVolume(e: Event) {
      const { volume } = (e as CustomEvent<{ volume: number }>).detail
      handleRef.current?.setVolume(volume)
    }

    window.addEventListener('matema:music-toggle', handleToggle)
    window.addEventListener('matema:music-volume', handleVolume)
    return () => {
      window.removeEventListener('matema:music-toggle', handleToggle)
      window.removeEventListener('matema:music-volume', handleVolume)
      stopMusic()
    }
  }, [])

  return null
}
