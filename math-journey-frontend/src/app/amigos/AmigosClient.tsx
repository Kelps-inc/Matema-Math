'use client'

import { useState, useTransition } from 'react'
import {
  searchUsersAction,
  sendFriendRequestAction,
  acceptFriendRequestAction,
} from '@/app/actions/duelo'
import { createDuelAction } from '@/app/actions/duelo'
import { useRouter } from 'next/navigation'
import { UserSearch, Loader2, UserPlus, Check, Clock, Users } from 'lucide-react'
import { cn } from '@/presentation/lib/utils'

type Friend    = { id: string; displayName: string; username: string; level: number; duelRating: number }
type Pending   = { id: string; displayName: string; username: string }
type SearchResult = Awaited<ReturnType<typeof searchUsersAction>>[number]

interface Props {
  initialFriends: Friend[]
  initialPending: Pending[]
}

export function AmigosClient({ initialFriends, initialPending }: Props) {
  const router = useRouter()

  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [pending, startTransition] = useTransition()

  // Local optimistic state
  const [friends,  setFriends]  = useState<Friend[]>(initialFriends)
  const [requests, setRequests] = useState<Pending[]>(initialPending)
  const [sent,     setSent]     = useState<Set<string>>(new Set())

  async function handleSearch(q: string) {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    setLoading(true)
    const res = await searchUsersAction(q)
    setResults(res)
    setLoading(false)
  }

  function handleAddFriend(userId: string) {
    setSent((s) => new Set(s).add(userId))
    startTransition(async () => {
      await sendFriendRequestAction(userId)
    })
  }

  function handleAccept(requester: Pending) {
    setRequests((r) => r.filter((x) => x.id !== requester.id))
    setFriends((f) =>
      [...f, { id: requester.id, displayName: requester.displayName, username: requester.username, level: 1, duelRating: 1000 }]
        .sort((a, b) => a.displayName.localeCompare(b.displayName, 'pt-BR')),
    )
    startTransition(async () => {
      await acceptFriendRequestAction(requester.id)
    })
  }

  function handleChallenge(friendId: string) {
    startTransition(async () => {
      const res = await createDuelAction({ type: 'challenge', opponentId: friendId })
      if (res.duelId) router.push(`/duelo/${res.duelId}`)
    })
  }

  const friendsSorted = [...friends].sort((a, b) =>
    a.displayName.localeCompare(b.displayName, 'pt-BR'),
  )

  return (
    <div className="space-y-6">

      {/* ── Search ── */}
      <div>
        <div className="relative mb-3">
          <UserSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-matema-muted" strokeWidth={1.75} />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar por nome ou usuário..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-matema-border focus:outline-none focus:border-matema-secondary bg-white text-matema-dark text-sm transition-colors"
          />
        </div>

        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 text-matema-muted animate-spin" />
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-2">
            {results.map((u) => {
              const alreadyFriend  = friends.some((f) => f.id === u.id)
              const sentRequest    = sent.has(u.id) || u.friendStatus === 'pending_sent'
              const pendingReceived = u.friendStatus === 'pending_received'

              return (
                <div key={u.id} className="flex items-center gap-3 bg-white rounded-2xl border border-matema-border px-4 py-3 shadow-sm">
                  <div className="w-9 h-9 bg-matema-secondary/10 rounded-full flex items-center justify-center text-sm font-extrabold text-matema-secondary flex-shrink-0">
                    {u.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-matema-dark text-sm truncate">{u.displayName}</p>
                    <p className="text-xs text-matema-muted">@{u.username} · Nível {u.level}</p>
                  </div>
                  {alreadyFriend ? (
                    <span className="text-xs font-bold text-matema-secondary flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                      Amigos
                    </span>
                  ) : sentRequest ? (
                    <span className="text-xs font-bold text-matema-muted flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                      Pendente
                    </span>
                  ) : pendingReceived ? (
                    <button
                      onClick={() => handleAccept({ id: u.id, displayName: u.displayName, username: u.username })}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl bg-matema-secondary text-white hover:opacity-90 transition-opacity"
                    >
                      Aceitar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddFriend(u.id)}
                      disabled={pending}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-matema-secondary/10 text-matema-secondary border border-matema-secondary/30 hover:bg-matema-secondary/20 transition-colors disabled:opacity-50"
                    >
                      <UserPlus className="w-3.5 h-3.5" strokeWidth={2} />
                      Adicionar
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {!loading && query.length >= 2 && results.length === 0 && (
          <p className="text-center text-sm text-matema-muted py-4">Nenhum jogador encontrado.</p>
        )}
      </div>

      {/* ── Pending requests ── */}
      {requests.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-matema-muted mb-3">
            Pedidos recebidos ({requests.length})
          </h2>
          <div className="space-y-2">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center gap-3 bg-white rounded-2xl border border-matema-secondary/30 px-4 py-3 shadow-sm">
                <div className="w-9 h-9 bg-matema-secondary/10 rounded-full flex items-center justify-center text-sm font-extrabold text-matema-secondary flex-shrink-0">
                  {r.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-matema-dark text-sm truncate">{r.displayName}</p>
                  <p className="text-xs text-matema-muted">@{r.username}</p>
                </div>
                <button
                  onClick={() => handleAccept(r)}
                  disabled={pending}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-matema-secondary text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Aceitar
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Friends list ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-matema-muted mb-3 flex items-center gap-2">
          <Users className="w-3.5 h-3.5" strokeWidth={2} />
          Amigos ({friendsSorted.length})
        </h2>

        {friendsSorted.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border border-matema-border">
            <Users className="w-10 h-10 text-matema-border mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-sm text-matema-muted font-semibold mb-1">Nenhum amigo ainda</p>
            <p className="text-xs text-matema-muted">Use a busca acima para encontrar jogadores</p>
          </div>
        ) : (
          <div className="space-y-2">
            {friendsSorted.map((f) => (
              <div key={f.id} className="flex items-center gap-3 bg-white rounded-2xl border border-matema-border px-4 py-3 shadow-sm">
                <div className="w-9 h-9 bg-matema-secondary/10 rounded-full flex items-center justify-center text-sm font-extrabold text-matema-secondary flex-shrink-0">
                  {f.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-matema-dark text-sm truncate">{f.displayName}</p>
                  <p className="text-xs text-matema-muted">@{f.username} · Nível {f.level} · Rating {f.duelRating}</p>
                </div>
                <button
                  onClick={() => handleChallenge(f.id)}
                  disabled={pending}
                  className={cn(
                    'flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl flex-shrink-0',
                    'bg-matema-accent/10 text-matema-accent border border-matema-accent/30 hover:bg-matema-accent/20 transition-colors disabled:opacity-50',
                  )}
                >
                  {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span className="text-base leading-none">🥷</span>}
                  Desafiar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
