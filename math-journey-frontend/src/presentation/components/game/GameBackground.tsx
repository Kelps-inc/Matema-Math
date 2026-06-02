'use client'

import { useEffect, useState } from 'react'

export function GameBackground() {
  const [isDark, setIsDark] = useState<boolean | null>(null)

  useEffect(() => {
    const root = document.documentElement
    const update = () => setIsDark(root.classList.contains('dark'))
    update()
    const observer = new MutationObserver(update)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // Não renderiza nada no SSR para evitar mismatch de hidratação
  if (isDark === null) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500"
      aria-hidden="true"
      style={{
        backgroundImage: isDark
          ? 'url(/backgrounds/game-bedroom.png)'
          : 'url(/backgrounds/game-day.png)',
        backgroundPosition: 'center bottom',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        opacity: 0.15,
      }}
    />
  )
}
