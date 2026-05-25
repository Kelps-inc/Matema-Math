'use client'

import { useEffect, useRef } from 'react'
import { createAudioContext, startAmbientMusic } from '@/presentation/lib/audio'

export function AudioManager() {
  const ctxRef  = useRef<AudioContext | null>(null)
  const stopRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const enabled = localStorage.getItem('matema_music_enabled') === 'true'
    if (enabled) startMusic()

    function startMusic() {
      if (!ctxRef.current) ctxRef.current = createAudioContext()
      const ctx = ctxRef.current
      if (!ctx) return
      if (ctx.state === 'suspended') ctx.resume()
      stopRef.current?.()
      stopRef.current = startAmbientMusic(ctx)
    }

    function stopMusic() {
      stopRef.current?.()
      stopRef.current = null
    }

    function handleToggle(e: Event) {
      const detail = (e as CustomEvent<{ enabled: boolean }>).detail
      if (detail.enabled) startMusic()
      else stopMusic()
    }

    window.addEventListener('matema:music-toggle', handleToggle)
    return () => {
      window.removeEventListener('matema:music-toggle', handleToggle)
      stopMusic()
    }
  }, [])

  return null
}
