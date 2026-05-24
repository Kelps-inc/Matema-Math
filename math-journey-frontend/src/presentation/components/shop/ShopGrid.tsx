'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/presentation/lib/utils'
import { purchaseItemAction } from '@/app/actions/shop'

export interface ShopItemDTO {
  id: string
  name: string
  description: string
  price: number
  category: 'material' | 'avatar' | 'acessorio'
  icon: string
}

const CATEGORY_LABELS: Record<string, string> = {
  material: '🎒 Materiais',
  avatar: '🧑 Avatares',
  acessorio: '✨ Acessórios',
}

interface ShopGridProps {
  items: ShopItemDTO[]
  ownedIds: Set<string>
  userCoins: number
}

export function ShopGrid({ items, ownedIds, userCoins }: ShopGridProps) {
  const [isPending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ id: string; ok: boolean; msg: string } | null>(null)
  const [localOwned, setLocalOwned] = useState<Set<string>>(ownedIds)
  const [localCoins, setLocalCoins] = useState(userCoins)

  const categories = ['material', 'avatar', 'acessorio'] as const

  function handleBuy(item: ShopItemDTO) {
    setPendingId(item.id)
    setFeedback(null)
    startTransition(async () => {
      const result = await purchaseItemAction(item.id)
      if (result.success) {
        setLocalOwned((prev) => new Set([...prev, item.id]))
        if (result.newCoins !== undefined) setLocalCoins(result.newCoins)
        setFeedback({ id: item.id, ok: true, msg: 'Item adquirido!' })
      } else {
        setFeedback({ id: item.id, ok: false, msg: result.error ?? 'Erro ao comprar' })
      }
      setPendingId(null)
    })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {categories.map((cat) => {
        const catItems = items.filter((i) => i.category === cat)
        if (catItems.length === 0) return null
        return (
          <section key={cat}>
            <h2 className="text-base font-bold text-matema-dark mb-4">{CATEGORY_LABELS[cat]}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {catItems.map((item) => {
                const owned = localOwned.has(item.id)
                const canAfford = localCoins >= item.price
                const loading = isPending && pendingId === item.id
                const fb = feedback?.id === item.id ? feedback : null

                return (
                  <div
                    key={item.id}
                    className={cn(
                      'bg-white rounded-3xl border-2 p-5 flex flex-col items-center text-center transition-all',
                      owned ? 'border-matema-secondary/40 bg-matema-secondary/5' : 'border-matema-border',
                    )}
                  >
                    <div className="text-5xl mb-3">{item.icon}</div>
                    <p className="font-bold text-matema-dark text-sm mb-1">{item.name}</p>
                    <p className="text-xs text-matema-muted leading-relaxed mb-4">{item.description}</p>

                    {fb && (
                      <p className={cn('text-xs font-semibold mb-2', fb.ok ? 'text-green-600' : 'text-red-500')}>
                        {fb.msg}
                      </p>
                    )}

                    {owned ? (
                      <span className="text-xs font-bold text-matema-secondary bg-matema-secondary/10 px-3 py-1.5 rounded-xl">
                        ✓ Adquirido
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={!canAfford || loading}
                        className={cn(
                          'flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-bold transition-all',
                          canAfford
                            ? 'bg-matema-primary text-white hover:bg-matema-primary/90'
                            : 'bg-matema-border text-matema-muted cursor-not-allowed',
                        )}
                      >
                        {loading ? '...' : <>🪙 {item.price}</>}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
