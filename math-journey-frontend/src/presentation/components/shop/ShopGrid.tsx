'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/presentation/lib/utils'
import { purchaseItemAction } from '@/app/actions/shop'
import { Avatar } from '@/presentation/components/avatar/Avatar'
import type { AvatarConfig } from '@/presentation/components/avatar/AvatarConfig'
import { DEFAULT_AVATAR_CONFIG } from '@/presentation/components/avatar/AvatarConfig'

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
  avatar:   '🧑 Avatares',
  acessorio:'✨ Acessórios',
}

type ShopTab = 'comprar' | 'adquiridos' | 'em-uso'

interface ShopGridProps {
  items: ShopItemDTO[]
  ownedItems: { id: string; name: string }[]
  userCoins: number
  avatarConfig?: AvatarConfig
  isAdmin?: boolean
}

export function ShopGrid({
  items,
  ownedItems,
  userCoins,
  avatarConfig = DEFAULT_AVATAR_CONFIG,
  isAdmin = false,
}: ShopGridProps) {
  const [tab, setTab] = useState<ShopTab>('comprar')
  const [isPending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ id: string; ok: boolean; msg: string } | null>(null)
  const [localOwned, setLocalOwned] = useState<{ id: string; name: string }[]>(ownedItems)
  const [localCoins, setLocalCoins] = useState(userCoins)

  const ownedIds   = new Set(localOwned.map((o) => o.id))
  const ownedNames = localOwned.map((o) => o.name)

  // Derived lists
  const unownedItems   = items.filter((i) => !ownedIds.has(i.id))
  const ownedItemsFull = items.filter((i) => ownedIds.has(i.id))
  // "Em uso" = owned items that visually affect the avatar (avatar costumes + accessories)
  const inUseItems     = ownedItemsFull.filter((i) => i.category === 'avatar' || i.category === 'acessorio')

  const tabs: { id: ShopTab; label: string; count: number }[] = [
    { id: 'comprar',    label: 'Para comprar', count: unownedItems.length },
    { id: 'adquiridos', label: 'Adquiridos',   count: ownedItemsFull.length },
    { id: 'em-uso',     label: 'Em uso',        count: inUseItems.length },
  ]

  function handleBuy(item: ShopItemDTO) {
    setPendingId(item.id)
    setFeedback(null)
    startTransition(async () => {
      const result = await purchaseItemAction(item.id)
      if (result.success) {
        setLocalOwned((prev) => [...prev, { id: item.id, name: item.name }])
        if (result.newCoins !== undefined) setLocalCoins(result.newCoins)
        setFeedback({ id: item.id, ok: true, msg: 'Item adquirido!' })
      } else {
        setFeedback({ id: item.id, ok: false, msg: result.error ?? 'Erro ao comprar' })
      }
      setPendingId(null)
    })
  }

  const categories = ['material', 'avatar', 'acessorio'] as const

  return (
    <div className="max-w-3xl mx-auto">

      {/* Avatar preview — always visible */}
      <div className="bg-white rounded-3xl border border-matema-border p-6 mb-6 flex flex-col items-center">
        <p className="text-xs font-semibold text-matema-muted mb-4 uppercase tracking-wide">Seu personagem</p>
        <Avatar config={avatarConfig} ownedItemNames={ownedNames} size={150} />
        {ownedNames.length === 0 && (
          <p className="text-xs text-matema-muted mt-3">Compre itens para personalizar seu personagem!</p>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl border border-matema-border overflow-hidden mb-6">
        <div className="flex border-b border-matema-border">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex-1 py-3.5 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5',
                tab === t.id
                  ? 'text-matema-primary border-b-2 border-matema-primary bg-matema-primary/5'
                  : 'text-matema-muted hover:text-matema-dark hover:bg-matema-warm',
              )}
            >
              {t.label}
              {t.count > 0 && (
                <span className={cn(
                  'text-xs font-bold px-1.5 py-0.5 rounded-full',
                  tab === t.id
                    ? 'bg-matema-primary/15 text-matema-primary'
                    : 'bg-matema-warm text-matema-muted',
                )}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* ── Para comprar ── */}
          {tab === 'comprar' && (
            unownedItems.length === 0 ? (
              <p className="text-center text-matema-muted text-sm py-8">
                🎉 Você já adquiriu todos os itens da loja!
              </p>
            ) : (
              <div className="space-y-8">
                {categories.map((cat) => {
                  const catItems = unownedItems.filter((i) => i.category === cat)
                  if (catItems.length === 0) return null
                  return (
                    <section key={cat}>
                      <h2 className="text-sm font-bold text-matema-dark mb-3">{CATEGORY_LABELS[cat]}</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {catItems.map((item) => {
                          const canAfford = isAdmin || localCoins >= item.price
                          const loading   = isPending && pendingId === item.id
                          const fb        = feedback?.id === item.id ? feedback : null

                          return (
                            <div key={item.id} className="bg-matema-cream rounded-2xl border border-matema-border p-4 flex flex-col items-center text-center">
                              <div className="text-4xl mb-2">{item.icon}</div>
                              <p className="font-bold text-matema-dark text-sm mb-1">{item.name}</p>
                              <p className="text-xs text-matema-muted leading-relaxed mb-3">{item.description}</p>
                              {fb && (
                                <p className={cn('text-xs font-semibold mb-2', fb.ok ? 'text-green-600' : 'text-red-500')}>
                                  {fb.msg}
                                </p>
                              )}
                              <button
                                onClick={() => handleBuy(item)}
                                disabled={!canAfford || loading}
                                className={cn(
                                  'flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-bold transition-all mt-auto',
                                  canAfford
                                    ? 'bg-matema-primary text-white hover:bg-matema-primary/90'
                                    : 'bg-matema-border text-matema-muted cursor-not-allowed',
                                )}
                              >
                                {loading ? '...' : <>🪙 {item.price}</>}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </section>
                  )
                })}
              </div>
            )
          )}

          {/* ── Adquiridos ── */}
          {tab === 'adquiridos' && (
            ownedItemsFull.length === 0 ? (
              <p className="text-center text-matema-muted text-sm py-8">
                Você ainda não adquiriu nenhum item.
              </p>
            ) : (
              <div className="space-y-8">
                {categories.map((cat) => {
                  const catItems = ownedItemsFull.filter((i) => i.category === cat)
                  if (catItems.length === 0) return null
                  return (
                    <section key={cat}>
                      <h2 className="text-sm font-bold text-matema-dark mb-3">{CATEGORY_LABELS[cat]}</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {catItems.map((item) => (
                          <div key={item.id} className="bg-white rounded-2xl border-2 border-matema-secondary/30 p-4 flex flex-col items-center text-center">
                            <div className="text-4xl mb-2">{item.icon}</div>
                            <p className="font-bold text-matema-dark text-sm mb-1">{item.name}</p>
                            <p className="text-xs text-matema-muted leading-relaxed mb-3">{item.description}</p>
                            <span className="text-xs font-bold text-matema-secondary bg-matema-secondary/10 px-3 py-1.5 rounded-xl mt-auto">
                              ✓ Adquirido
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )
                })}
              </div>
            )
          )}

          {/* ── Em uso ── */}
          {tab === 'em-uso' && (
            inUseItems.length === 0 ? (
              <p className="text-center text-matema-muted text-sm py-8">
                Nenhum item visual equipado ainda.<br />
                <span className="text-xs">Compre fantasias ou acessórios para personalizar seu personagem.</span>
              </p>
            ) : (
              <div className="space-y-8">
                {categories.filter((c) => c !== 'material').map((cat) => {
                  const catItems = inUseItems.filter((i) => i.category === cat)
                  if (catItems.length === 0) return null
                  return (
                    <section key={cat}>
                      <h2 className="text-sm font-bold text-matema-dark mb-3">{CATEGORY_LABELS[cat]}</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {catItems.map((item) => (
                          <div key={item.id} className="bg-white rounded-2xl border-2 border-matema-primary/30 p-4 flex flex-col items-center text-center">
                            <div className="text-4xl mb-2">{item.icon}</div>
                            <p className="font-bold text-matema-dark text-sm mb-1">{item.name}</p>
                            <p className="text-xs text-matema-muted leading-relaxed mb-3">{item.description}</p>
                            <span className="text-xs font-bold text-matema-primary bg-matema-primary/10 px-3 py-1.5 rounded-xl mt-auto">
                              ⚡ Em uso
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )
                })}
              </div>
            )
          )}

        </div>
      </div>

    </div>
  )
}
