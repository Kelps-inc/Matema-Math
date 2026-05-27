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
  const clickBufRef = useRef<AudioBuffer | null>(null)

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

    async function loadClickSound(ctx: AudioContext) {
      if (clickBufRef.current) return
      try {
        const res = await fetch('/sounds/click.mp3')
        const arr = await res.arrayBuffer()
        clickBufRef.current = await ctx.decodeAudioData(arr)
      } catch { /* sem som se falhar */ }
    }

    function handleClickSfx(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest('button, a, [role="button"]')) return
      if (!ctxRef.current) ctxRef.current = createAudioContext()
      const ctx = ctxRef.current
      if (!ctx) return
      if (ctx.state === 'suspended') ctx.resume()

      if (!clickBufRef.current) {
        loadClickSound(ctx)
        return
      }

      const src = ctx.createBufferSource()
      const gain = ctx.createGain()
      src.buffer = clickBufRef.current
      gain.gain.setValueAtTime(0.6, ctx.currentTime)
      src.connect(gain)
      gain.connect(ctx.destination)
      src.start()
    }

    window.addEventListener('matema:music-toggle', handleToggle)
    window.addEventListener('matema:music-volume', handleVolume)
    document.addEventListener('click', handleClickSfx, true)
    return () => {
      window.removeEventListener('matema:music-toggle', handleToggle)
      window.removeEventListener('matema:music-volume', handleVolume)
      document.removeEventListener('click', handleClickSfx, true)
      stopMusic()
    }
  }, [])

  return null
}
