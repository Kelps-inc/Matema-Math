'use client'

import { useEffect, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

export function LandingMusicPlayer() {
  const [playing, setPlaying] = useState(false)
  const [visible, setVisible] = useState(false)
  const [fadeIn,  setFadeIn]  = useState(false)

  useEffect(() => {
    const enabled = localStorage.getItem('matema_music_enabled')
    const isEnabled = enabled === null ? true : enabled === 'true'
    setPlaying(isEnabled)

    // Força sempre Washed Dreams do começo na landing, ignorando localStorage de track
    if (isEnabled) {
      window.dispatchEvent(new CustomEvent('matema:music-force', {
        detail: { track: 'ghoul-projeto-novo' }
      }))
    }

    function onState(e: Event) {
      setPlaying((e as CustomEvent<{ playing: boolean }>).detail.playing)
    }
    window.addEventListener('matema:music-state', onState)

    const t1 = setTimeout(() => setVisible(true), 1200)
    const t2 = setTimeout(() => setFadeIn(true),  1250)

    return () => {
      window.removeEventListener('matema:music-state', onState)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  function toggle() {
    const next = !playing
    setPlaying(next)
    localStorage.setItem('matema_music_enabled', String(next))

    if (next) {
      // Sempre força Washed Dreams na landing — nunca usa o track do localStorage
      window.dispatchEvent(new CustomEvent('matema:music-force', {
        detail: { track: 'ghoul-projeto-novo' }
      }))
    } else {
      window.dispatchEvent(new CustomEvent('matema:music-toggle', { detail: { enabled: false } }))
    }
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-5 right-5 z-50 transition-all duration-700"
      style={{ opacity: fadeIn ? 1 : 0, transform: fadeIn ? 'translateY(0)' : 'translateY(12px)' }}
    >
      <button
        onClick={toggle}
        aria-label={playing ? 'Pausar música' : 'Tocar música'}
        title={playing ? 'Pausar música' : 'Tocar música (Washed Dreams)'}
        className="relative flex items-center justify-center w-11 h-11 rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-matema-primary"
        style={{
          background: playing ? 'linear-gradient(135deg,#D4845A,#8B7CC4)' : 'rgba(255,255,255,0.92)',
          border: playing ? 'none' : '1.5px solid #E8E0D4',
        }}
      >
        {playing && (
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: 'linear-gradient(135deg,#D4845A50,#8B7CC450)', animationDuration: '1.8s' }}
          />
        )}
        {playing
          ? <Volume2  className="w-5 h-5 text-white relative z-10" strokeWidth={1.75} />
          : <VolumeX  className="w-5 h-5 relative z-10" style={{ color: '#9E8F88' }} strokeWidth={1.75} />
        }
      </button>

      {!playing && (
        <span
          className="absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap text-xs font-semibold px-2.5 py-1 rounded-lg shadow pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #E8E0D4', color: '#6B5F58' }}
        >
          ♪ Washed Dreams
        </span>
      )}
    </div>
  )
}
