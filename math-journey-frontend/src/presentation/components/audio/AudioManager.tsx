'use client'

import { useEffect, useRef } from 'react'
import { createAudioContext, startAmbientMusic, startRainSound } from '@/presentation/lib/audio'

type AudioHandle = { stop: () => void; setVolume: (v: number) => void }

function getVol(key: string) {
  const v = parseFloat(localStorage.getItem(key) ?? '50')
  return (isNaN(v) ? 50 : v) / 100
}

export function AudioManager() {
  const ctxRef      = useRef<AudioContext | null>(null)
  const handleRef   = useRef<AudioHandle | null>(null)
  const rainRef     = useRef<AudioHandle | null>(null)
  const clickBufRef = useRef<AudioBuffer | null>(null)

  useEffect(() => {
    const musicEnabled = localStorage.getItem('matema_music_enabled') === 'true'
    const rainEnabled  = localStorage.getItem('matema_rain_enabled')  === 'true'
    if (musicEnabled) startMusic()
    if (rainEnabled)  startRain()

    function startMusic() {
      if (!ctxRef.current) ctxRef.current = createAudioContext()
      const ctx = ctxRef.current
      if (!ctx) return
      if (ctx.state === 'suspended') ctx.resume()
      handleRef.current?.stop()
      handleRef.current = startAmbientMusic(ctx, getVol('matema_music_volume'))
    }

    function stopMusic() {
      handleRef.current?.stop()
      handleRef.current = null
    }

    function startRain() {
      if (!ctxRef.current) ctxRef.current = createAudioContext()
      const ctx = ctxRef.current
      if (!ctx) return
      if (ctx.state === 'suspended') ctx.resume()
      rainRef.current?.stop()
      rainRef.current = startRainSound(ctx, getVol('matema_rain_volume'))
    }

    function stopRain() {
      rainRef.current?.stop()
      rainRef.current = null
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

    function handleRainToggle(e: Event) {
      const detail = (e as CustomEvent<{ enabled: boolean }>).detail
      if (detail.enabled) startRain()
      else stopRain()
    }

    function handleRainVolume(e: Event) {
      const { volume } = (e as CustomEvent<{ volume: number }>).detail
      rainRef.current?.setVolume(volume)
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
    window.addEventListener('matema:rain-toggle',  handleRainToggle)
    window.addEventListener('matema:rain-volume',  handleRainVolume)
    document.addEventListener('click', handleClickSfx, true)
    return () => {
      window.removeEventListener('matema:music-toggle', handleToggle)
      window.removeEventListener('matema:music-volume', handleVolume)
      window.removeEventListener('matema:rain-toggle',  handleRainToggle)
      window.removeEventListener('matema:rain-volume',  handleRainVolume)
      document.removeEventListener('click', handleClickSfx, true)
      stopMusic()
      stopRain()
    }
  }, [])

  return null
}
