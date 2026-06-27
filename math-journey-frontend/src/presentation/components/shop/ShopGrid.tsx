'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/presentation/lib/utils'
import { purchaseItemAction } from '@/app/actions/shop'
import { Avatar } from '@/presentation/components/avatar/Avatar'
import type { AvatarConfig } from '@/presentation/components/avatar/AvatarConfig'
import { DEFAULT_AVATAR_CONFIG } from '@/presentation/components/avatar/AvatarConfig'
import { Coins, PartyPopper } from 'lucide-react'

export interface ShopItemDTO {
  id: string
  name: string
  description: string
  price: number
  category: 'avatar' | 'acessorio' | 'powerup'
  icon: string
}

const CATEGORY_LABELS: Record<string, string> = {
  powerup:   'Power-ups',
  avatar:    'Avatares',
  acessorio: 'Acessórios',
}

type ShopTab = 'comprar' | 'adquiridos'

interface ShopGridProps {
  items: ShopItemDTO[]
  ownedItems: { id: string; name: string }[]
  equippedItemIds: string[]
  quantities?: Record<string, number>
  userCoins: number
  avatarConfig?: AvatarConfig
  isAdmin?: boolean
}

export function ShopGrid({
  items,
  ownedItems,
  equippedItemIds,
  quantities = {},
  userCoins,
  avatarConfig = DEFAULT_AVATAR_CONFIG,
  isAdmin = false,
}: ShopGridProps) {
  const [tab, setTab] = useState<ShopTab>('comprar')
  const [isPending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [feedback,  setFeedback]  = useState<{ id: string; ok: boolean; msg: string } | null>(null)
  const [localOwned, setLocalOwned] = useState<{ id: string; name: string }[]>(ownedItems)
  const [localCoins, setLocalCoins] = useState(userCoins)
  const [localQty,   setLocalQty]   = useState<Record<string, number>>(quantities)

  const ownedIds = new Set(localOwned.map((o) => o.id))
  // Avatar preview: only acessorio items that are equipped (matches Avatar tab behaviour)
  const equippedSet    = new Set(equippedItemIds)
  const equippedNames  = items
    .filter((i) => i.category === 'acessorio' && equippedSet.has(i.id))
    .map((i) => i.name)

  // Power-ups são consumíveis: sempre compráveis, nunca vão para "adquiridos".
  const powerupItems   = items.filter((i) => i.category === 'powerup')
  const cosmeticItems  = items.filter((i) => i.category !== 'powerup')
  const unownedCosmetics = cosmeticItems.filter((i) => !ownedIds.has(i.id))
  const ownedCosmetics   = cosmeticItems.filter((i) => ownedIds.has(i.id))

  const tabs: { id: ShopTab; label: string; count: number }[] = [
    { id: 'comprar',    label: 'Para comprar', count: powerupItems.length + unownedCosmetics.length },
    { id: 'adquiridos', label: 'Adquiridos',   count: ownedCosmetics.length },
  ]

  const buyCategories: ShopItemDTO['category'][] = ['powerup', 'avatar', 'acessorio']
  const ownedCategories: ShopItemDTO['category'][] = ['avatar', 'acessorio']

  // ── Buy ──────────────────────────────────────────────────────────
  function handleBuy(item: ShopItemDTO) {
    setPendingId(item.id)
    setFeedback(null)
    startTransition(async () => {
      const result = await purchaseItemAction(item.id)
      if (result.success) {
        if (item.category === 'powerup') {
          setLocalQty((prev) => ({ ...prev, [item.id]: (prev[item.id] ?? 0) + 1 }))
          setFeedback({ id: item.id, ok: true, msg: 'Power-up comprado! Use na Ranqueada.' })
        } else {
          setLocalOwned((prev) => [...prev, { id: item.id, name: item.name }])
          setFeedback({ id: item.id, ok: true, msg: 'Item adquirido! Equipe-o na aba Avatar.' })
        }
        if (result.newCoins !== undefined) setLocalCoins(result.newCoins)
      } else {
        setFeedback({ id: item.id, ok: false, msg: result.error ?? 'Erro ao comprar' })
      }
      setPendingId(null)
    })
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* Avatar preview — reflects currently equipped accessories */}
      <div className="bg-white rounded-3xl border border-matema-border p-6 mb-6 flex flex-col items-center">
        <p className="text-xs font-semibold text-matema-muted mb-4 uppercase tracking-wide">Seu personagem</p>
        <Avatar config={avatarConfig} ownedItemNames={equippedNames} size={150} />
        {equippedNames.length === 0 && (
          <p className="text-xs text-matema-muted mt-3">Compre acessórios e equipe-os na aba Avatar!</p>
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
            <div className="space-y-8">
              {buyCategories.map((cat) => {
                const catItems = cat === 'powerup'
                  ? powerupItems
                  : unownedCosmetics.filter((i) => i.category === cat)
                if (catItems.length === 0) return null
                return (
                  <section key={cat}>
                    <h2 className="text-sm font-bold text-matema-dark mb-1">{CATEGORY_LABELS[cat]}</h2>
                    {cat === 'powerup' && (
                      <p className="text-xs text-matema-muted mb-3">Consumíveis para usar nas partidas ranqueadas. Compre quantos quiser.</p>
                    )}
                    {cat !== 'powerup' && <div className="mb-3" />}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {catItems.map((item) => {
                        const canAfford = isAdmin || localCoins >= item.price
                        const loading   = isPending && pendingId === item.id
                        const fb        = feedback?.id === item.id ? feedback : null
                        const owned     = item.category === 'powerup' ? (localQty[item.id] ?? 0) : 0
                        return (
                          <div key={item.id} className="bg-matema-cream rounded-2xl border border-matema-border p-4 flex flex-col items-center text-center">
                            <div className="text-4xl mb-2 relative">
                              {item.icon}
                              {item.category === 'powerup' && owned > 0 && (
                                <span className="absolute -top-1 -right-3 text-[10px] font-extrabold text-white bg-matema-accent rounded-full px-1.5 py-0.5 leading-none">
                                  ×{owned}
                                </span>
                              )}
                            </div>
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
                              {loading ? '...' : (
                                <>
                                  <Coins className="w-4 h-4 text-amber-300" strokeWidth={1.75} />
                                  {item.price}
                                </>
                              )}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )
              })}
              {powerupItems.length === 0 && unownedCosmetics.length === 0 && (
                <div className="text-center text-matema-muted text-sm py-8 flex flex-col items-center gap-2">
                  <PartyPopper className="w-7 h-7 text-matema-primary" strokeWidth={1.75} />
                  <span>Você já adquiriu todos os itens da loja!</span>
                </div>
              )}
            </div>
          )}

          {/* ── Adquiridos ── (só cosméticos; power-ups são consumíveis) */}
          {tab === 'adquiridos' && (
            ownedCosmetics.length === 0 ? (
              <p className="text-center text-matema-muted text-sm py-8">
                Você ainda não adquiriu nenhum item.
              </p>
            ) : (
              <div className="space-y-8">
                {ownedCategories.map((cat) => {
                  const catItems = ownedCosmetics.filter((i) => i.category === cat)
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
                              Adquirido
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )
                })}
                <p className="text-center text-xs text-matema-muted pt-2">
                  Para equipar acessórios, acesse a aba <strong>Avatar</strong>.
                </p>
              </div>
            )
          )}

        </div>
      </div>
    </div>
  )
}
