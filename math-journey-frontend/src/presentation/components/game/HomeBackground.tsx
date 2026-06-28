'use client'

import { useEffect, useState } from 'react'

export function HomeBackground() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const update = () => setIsDark(root.classList.contains('dark'))
    update()
    const observer = new MutationObserver(update)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className="flex-1 w-full"
      style={{
        backgroundImage: isDark
          ? 'url(/backgrounds/game-bedroom.png)'
          : 'url(/backgrounds/game-day.png)',
        backgroundPosition: 'center bottom',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    />
  )
}
