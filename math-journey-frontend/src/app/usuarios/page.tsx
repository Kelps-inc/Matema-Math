'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  searchUsersAction,
  sendFriendRequestAction,
  acceptFriendRequestAction,
  createDuelAction,
  getMyFriendsAction,
} from '@/app/actions/duelo'
import { NinjaIcon } from '@/presentation/components/game/NinjaIcon'
import { UserSearch, UserPlus, UserCheck, Loader2, Users, Clock } from 'lucide-react'
import { cn } from '@/presentation/lib/utils'
import { useEffect } from 'react'

type SearchUser = Awaited<ReturnType<typeof searchUsersAction>>[number]
type Friend     = { id: string; displayName: string; username: string; level: number; duelRating: number }
type PendingReq = { id: string; displayName: string; username: string }

export default function UsuariosPage() {
  const router  = useRouter()
  const [tab,   setTab]   = useState<'buscar' | 'amigos'>('buscar')
  const [query, setQuery] = useState('')
  const [results, setResults]   = useState<SearchUser[]>([])
  const [searching,  setSearching]  = useState(false)
  const [friends,    setFriends]    = useState<Friend[]>([])
  const [pending,    setPending]    = useState<PendingReq[]>([])
  const [loadingFriends, setLoadingFriends] = useState(false)

  const [actionPending, startAction] = useTransition()
  const [actionStates, setActionStates] = useState<Record<string, string>>({})

  useEffect(() => {
    if (tab === 'amigos') loadFriends()
  }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadFriends() {
    setLoadingFriends(true)
    const res = await getMyFriendsAction()
    setFriends(res.friends)
    setPending(res.pendingReceived)
    setLoadingFriends(false)
  }

  async function handleSearch(q: string) {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    setSearching(true)
    const res = await searchUsersAction(q)
    setResults(res)
    setSearching(false)
  }

  function handleAddFriend(userId: string) {
    setActionStates((s) => ({ ...s, [userId]: 'sending' }))
    startAction(async () => {
      await sendFriendRequestAction(userId)
      setActionStates((s) => ({ ...s, [userId]: 'sent' }))
      setResults((prev) => prev.map((u) => u.id === userId ? { ...u, friendStatus: 'pending_sent' } : u))
    })
  }

  function handleAccept(requesterId: string) {
    startAction(async () => {
      await acceptFriendRequestAction(requesterId)
      await loadFriends()
    })
  }

  function handleChallenge(userId: string) {
    startAction(async () => {
      const res = await createDuelAction({ type: 'challenge', opponentId: userId })
      if (res.duelId) router.push(`/duelo/${res.duelId}`)
      else if (res.proRequired) router.push('/pro')
    })
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">

      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 bg-matema-secondary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Users className="w-6 h-6 text-matema-secondary" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-matema-dark leading-none">Jogadores</h1>
          <p className="text-sm text-matema-muted">Busque, adicione amigos e desafie</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-matema-warm rounded-2xl p-1 mb-6">
        {(['buscar', 'amigos'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 rounded-xl text-sm font-bold transition-all',
              tab === t ? 'bg-white text-matema-dark shadow-sm' : 'text-matema-muted hover:text-matema-dark',
            )}
          >
            {t === 'buscar' ? 'Buscar' : `Amigos${pending.length > 0 ? ` (${pending.length})` : ''}`}
          </button>
        ))}
      </div>

      {/* ── Search tab ── */}
      {tab === 'buscar' && (
        <div className="space-y-4">
          <div className="relative">
            <UserSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-matema-muted" strokeWidth={1.75} />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar por nome ou @usuário..."
              autoFocus
              className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-matema-border focus:outline-none focus:border-matema-accent bg-white text-matema-dark text-sm"
            />
          </div>

          {searching && <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-matema-muted animate-spin" /></div>}

          {!searching && results.length === 0 && query.length >= 2 && (
            <p className="text-center text-sm text-matema-muted py-8">Nenhum jogador encontrado.</p>
          )}

          {results.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              onAddFriend={() => handleAddFriend(u.id)}
              onChallenge={() => handleChallenge(u.id)}
              busy={actionPending}
            />
          ))}

          {results.length === 0 && query.length === 0 && (
            <div className="text-center py-12">
              <UserSearch className="w-10 h-10 text-matema-border mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-sm text-matema-muted">Digite pelo menos 2 caracteres para buscar</p>
            </div>
          )}
        </div>
      )}

      {/* ── Friends tab ── */}
      {tab === 'amigos' && (
        <div className="space-y-4">
          {loadingFriends && <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-matema-muted animate-spin" /></div>}

          {!loadingFriends && pending.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-matema-muted mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                Pedidos recebidos
              </h3>
              <div className="space-y-2">
                {pending.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 bg-matema-warm rounded-2xl border border-amber-200 p-3">
                    <Avatar name={p.displayName} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-matema-dark text-sm">{p.displayName}</p>
                      <p className="text-xs text-matema-muted">@{p.username}</p>
                    </div>
                    <button
                      onClick={() => handleAccept(p.id)}
                      disabled={actionPending}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl bg-matema-secondary text-white hover:opacity-90 flex items-center gap-1 disabled:opacity-50"
                    >
                      <UserCheck className="w-3.5 h-3.5" strokeWidth={2} />
                      Aceitar
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {!loadingFriends && friends.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-matema-muted mb-2">Amigos ({friends.length})</h3>
              <div className="space-y-2">
                {friends.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 bg-white rounded-2xl border border-matema-border p-3">
                    <Avatar name={f.displayName} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-matema-dark text-sm">{f.displayName}</p>
                      <p className="text-xs text-matema-muted">@{f.username} · Nível {f.level} · {f.duelRating} rating</p>
                    </div>
                    <button
                      onClick={() => handleChallenge(f.id)}
                      disabled={actionPending}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl bg-matema-accent text-white hover:opacity-90 flex items-center gap-1 disabled:opacity-50"
                    >
                      <NinjaIcon className="w-3 h-3" />
                      Duelo
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {!loadingFriends && friends.length === 0 && pending.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-matema-border mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-sm text-matema-muted mb-1">Nenhum amigo ainda</p>
              <button onClick={() => setTab('buscar')} className="text-sm text-matema-accent font-semibold hover:opacity-80">
                Buscar jogadores →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-9 h-9 bg-matema-accent/10 rounded-full flex items-center justify-center text-sm font-extrabold text-matema-accent flex-shrink-0">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function UserRow({
  user,
  onAddFriend,
  onChallenge,
  busy,
}: {
  user: SearchUser
  onAddFriend: () => void
  onChallenge: () => void
  busy: boolean
}) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl border border-matema-border p-3">
      <div className="w-10 h-10 bg-matema-accent/10 rounded-full flex items-center justify-center text-sm font-extrabold text-matema-accent flex-shrink-0">
        {user.displayName.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-matema-dark text-sm truncate">{user.displayName}</p>
        <p className="text-xs text-matema-muted">@{user.username} · Nível {user.level} · {user.duelRating} rating</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        {user.friendStatus === 'none' && (
          <button
            onClick={onAddFriend}
            disabled={busy}
            className="text-xs font-bold px-2.5 py-1.5 rounded-xl border-2 border-matema-secondary text-matema-secondary hover:bg-matema-secondary/10 flex items-center gap-1 disabled:opacity-50"
          >
            <UserPlus className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        )}
        {user.friendStatus === 'pending_sent' && (
          <span className="text-[10px] text-matema-muted border border-matema-border rounded-lg px-2 py-1">Enviado</span>
        )}
        {user.friendStatus === 'pending_received' && (
          <span className="text-[10px] text-amber-600 border border-amber-200 rounded-lg px-2 py-1">Aceitar</span>
        )}
        {user.friendStatus === 'friends' && (
          <UserCheck className="w-4 h-4 text-matema-secondary" strokeWidth={2} />
        )}
        <button
          onClick={onChallenge}
          disabled={busy}
          className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-matema-accent text-white hover:opacity-90 flex items-center gap-1 disabled:opacity-50"
        >
          <NinjaIcon className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
