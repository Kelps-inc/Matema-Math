'use client'

import { useEffect } from 'react'
import { touchPresenceAction } from '@/app/actions/chat'

/**
 * Mantém o usuário "online": grava last_active_at a cada 60s (e ao voltar para
 * a aba). Componente invisível, montado uma vez no header do jogo.
 */
export function PresenceHeartbeat() {
  useEffect(() => {
    const beat = () => {
      if (document.visibilityState === 'visible') void touchPresenceAction()
    }
    beat()
    const id = setInterval(beat, 60_000)
    document.addEventListener('visibilitychange', beat)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', beat)
    }
  }, [])
  return null
}
