'use client'

import { useEffect, useRef } from 'react'
import { createAudioContext, startAmbientMusic, startRainSound } from '@/presentation/lib/audio'

type AudioHandle = { stop: () => void; setVolume: (v: number) => void }

function getVol(key: string) {
  const v = parseFloat(localStorage.getItem(key) ?? '50')
  return (isNaN(v) ? 50 : v) / 100
}

// Playlist do Ghoul Soundtrack — toca em sequência e faz loop
const GHOUL_PLAYLIST = [
  '/sounds/ghoul-helium.wav',
  '/sounds/ghoul-projeto-novo.wav',
]

// Defaults: Washed Dreams (Projeto Novo) habilitada para novos usuários
function getMusicEnabled(): boolean {
  const stored = localStorage.getItem('matema_music_enabled')
  if (stored === null) return true       // novo usuário → música ligada
  return stored === 'true'
}

// Faixas avulsas que tocam em loop simples (não entram na playlist)
const LOOP_TRACKS: Record<string, string> = {
  'ghoul-projeto-novo': '/sounds/ghoul-projeto-novo.wav',
}

function getMusicTrack(): string {
  return localStorage.getItem('matema_music_track') ?? 'ghoul-projeto-novo'
}

function broadcastState(playing: boolean) {
  window.dispatchEvent(new CustomEvent('matema:music-state', { detail: { playing } }))
}

export function AudioManager() {
  const ctxRef         = useRef<AudioContext | null>(null)
  const synthRef       = useRef<AudioHandle | null>(null)
  const rainRef        = useRef<AudioHandle | null>(null)
  const fileAudioRef   = useRef<HTMLAudioElement | null>(null)
  const playlistIdxRef = useRef(0)   // índice atual na playlist Ghoul
  const clickBufRef    = useRef<AudioBuffer | null>(null)
  const pendingRef     = useRef(false)

  useEffect(() => {
    const musicEnabled = getMusicEnabled()
    const rainEnabled  = localStorage.getItem('matema_rain_enabled') === 'true'

    if (rainEnabled) startRain()

    if (musicEnabled) {
      // Tenta iniciar imediatamente; se o browser bloquear, espera primeiro clique
      startMusicOrPend()
    }

    function startMusicOrPend() {
      const started = tryStartMusic()
      if (!started) {
        pendingRef.current = true
        broadcastState(false)
      }
    }

    // Inicia a playlist Ghoul reutilizando sempre o mesmo elemento <audio>
    // (reusar o elemento evita que o browser bloqueie o autoplay nas faixas seguintes)
    function startGhoulPlaylist(vol: number) {
      synthRef.current?.stop()
      synthRef.current = null

      // Cria o elemento uma única vez
      if (!fileAudioRef.current) {
        const audio = new Audio()
        audio.volume = vol
        audio.onended = () => {
          playlistIdxRef.current = (playlistIdxRef.current + 1) % GHOUL_PLAYLIST.length
          if (fileAudioRef.current) {
            fileAudioRef.current.src = GHOUL_PLAYLIST[playlistIdxRef.current]
            fileAudioRef.current.load()
            fileAudioRef.current.play().catch(() => {})
          }
        }
        fileAudioRef.current = audio
      }

      fileAudioRef.current.volume = vol
      fileAudioRef.current.src = GHOUL_PLAYLIST[playlistIdxRef.current]
      fileAudioRef.current.load()

      const promise = fileAudioRef.current.play()
      if (promise !== undefined) {
        promise.then(() => {
          pendingRef.current = false
          broadcastState(true)
        }).catch(() => {
          pendingRef.current = true
          broadcastState(false)
        })
      }
    }

    // Retorna true se conseguiu iniciar, false se foi bloqueado pelo browser
    function tryStartMusic(): boolean {
      stopMusicSilent()
      const track = getMusicTrack()
      const vol   = getVol('matema_music_volume')

      if (track === 'ghoul') {
        startGhoulPlaylist(vol)
        return true
      } else if (LOOP_TRACKS[track]) {
        // Faixa avulsa em loop simples (ex: Washed Dreams no menu)
        const audio = new Audio(LOOP_TRACKS[track])
        audio.loop   = true
        audio.volume = vol
        audio.play()
          .then(() => { pendingRef.current = false; broadcastState(true) })
          .catch(() => { pendingRef.current = true;  broadcastState(false) })
        fileAudioRef.current = audio
        return true
      } else {
        // Trilha padrão sintetizada
        if (!ctxRef.current) ctxRef.current = createAudioContext()
        const ctx = ctxRef.current
        if (!ctx) return false
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {})
          pendingRef.current = true
          return false
        }
        synthRef.current = startAmbientMusic(ctx, vol)
        broadcastState(true)
        return true
      }
    }

    function stopMusicSilent() {
      synthRef.current?.stop()
      synthRef.current = null
      if (fileAudioRef.current) {
        fileAudioRef.current.pause()
        fileAudioRef.current.src = ''
        fileAudioRef.current = null
      }
    }

    function stopMusic() {
      stopMusicSilent()
      broadcastState(false)
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

    // Força uma faixa específica imediatamente (sem alterar localStorage)
    // Usado pela landing page para garantir que toca Washed Dreams
    function handleForce(e: Event) {
      const { track } = (e as CustomEvent<{ track: string }>).detail
      stopMusicSilent()
      const vol = getVol('matema_music_volume')
      if (LOOP_TRACKS[track]) {
        const audio = new Audio(LOOP_TRACKS[track])
        audio.loop   = true
        audio.volume = vol
        audio.play()
          .then(() => { pendingRef.current = false; broadcastState(true) })
          .catch(() => { pendingRef.current = true;  broadcastState(false) })
        fileAudioRef.current = audio
      }
    }

    function handleToggle(e: Event) {
      const { enabled } = (e as CustomEvent<{ enabled: boolean }>).detail
      localStorage.setItem('matema_music_enabled', String(enabled))
      if (enabled) tryStartMusic()
      else stopMusic()
    }

    function handleVolume(e: Event) {
      const { volume } = (e as CustomEvent<{ volume: number }>).detail
      synthRef.current?.setVolume(volume)
      if (fileAudioRef.current) fileAudioRef.current.volume = volume
    }

    function handleTrackChange() {
      const musicEnabled = getMusicEnabled()
      if (musicEnabled) tryStartMusic()
    }

    function handleRainToggle(e: Event) {
      const { enabled } = (e as CustomEvent<{ enabled: boolean }>).detail
      if (enabled) startRain()
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

    function handleFirstInteraction() {
      if (!pendingRef.current) return
      pendingRef.current = false
      tryStartMusic()
    }

    function handleClickSfx(e: MouseEvent) {
      // Aproveita o clique para resolver o pendente de autoplay
      handleFirstInteraction()

      if (localStorage.getItem('matema_sfx_enabled') === 'false') return
      const target = e.target as HTMLElement
      if (!target.closest('button, a, [role="button"]')) return
      if (!ctxRef.current) ctxRef.current = createAudioContext()
      const ctx = ctxRef.current
      if (!ctx) return
      if (ctx.state === 'suspended') ctx.resume()
      if (!clickBufRef.current) { loadClickSound(ctx); return }
      const src  = ctx.createBufferSource()
      const gain = ctx.createGain()
      src.buffer = clickBufRef.current
      gain.gain.setValueAtTime(0.6, ctx.currentTime)
      src.connect(gain)
      gain.connect(ctx.destination)
      src.start()
    }

    window.addEventListener('matema:music-force',  handleForce)
    window.addEventListener('matema:music-toggle', handleToggle)
    window.addEventListener('matema:music-volume', handleVolume)
    window.addEventListener('matema:music-track',  handleTrackChange)
    window.addEventListener('matema:rain-toggle',  handleRainToggle)
    window.addEventListener('matema:rain-volume',  handleRainVolume)
    document.addEventListener('click', handleClickSfx, true)

    return () => {
      window.removeEventListener('matema:music-force',  handleForce)
      window.removeEventListener('matema:music-toggle', handleToggle)
      window.removeEventListener('matema:music-volume', handleVolume)
      window.removeEventListener('matema:music-track',  handleTrackChange)
      window.removeEventListener('matema:rain-toggle',  handleRainToggle)
      window.removeEventListener('matema:rain-volume',  handleRainVolume)
      document.removeEventListener('click', handleClickSfx, true)
      stopMusic()
      stopRain()
    }
  }, [])

  return null
}
