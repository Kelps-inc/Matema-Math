'use client'

import { useEffect, useState } from 'react'
import { getOnlineFriendCountAction } from '@/app/actions/chat'

/** Mostra "(N)" de amigos online ao lado de "Amigos" no header. Poll leve (60s). */
export function AmigosOnlineBadge() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let alive = true
    const load = async () => {
      const n = await getOnlineFriendCountAction()
      if (alive) setCount(n)
    }
    load()
    const id = setInterval(load, 60_000)
    return () => { alive = false; clearInterval(id) }
  }, [])

  if (!count) return null
  return <span className="text-green-400 font-bold">({count})</span>
}
