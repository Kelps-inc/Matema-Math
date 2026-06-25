'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { NinjaIcon } from '@/presentation/components/game/NinjaIcon'
import { createDuelAction, joinDuelByCodeAction, searchUsersAction } from '@/app/actions/duelo'
import { Shuffle, Link2, UserSearch, ChevronRight, Loader2, Users } from 'lucide-react'
import { cn } from '@/presentation/lib/utils'

type Screen = 'menu' | 'invite' | 'search' | 'invite-result'

export default function DueloCriarPage() {
  const router   = useRouter()
  const [screen, setScreen]         = useState<Screen>('menu')
  const [pending, startTransition]  = useTransition()
  const [error, setError]           = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [codeInput, setCodeInput]   = useState('')
  const [searchQ, setSearchQ]       = useState('')
  const [results, setResults]       = useState<Awaited<ReturnType<typeof searchUsersAction>>>([])
  const [searching, setSearching]   = useState(false)

  function handleRandom() {
    setError('')
    startTransition(async () => {
      const res = await createDuelAction({ type: 'random' })
      if (res.error) { setError(res.error); return }
      router.push(`/duelo/${res.duelId}`)
    })
  }

  function handleGenerateLink() {
    setError('')
    startTransition(async () => {
      const res = await createDuelAction({ type: 'invite' })
      if (res.error) { setError(res.error); return }
      setInviteCode(res.inviteCode ?? '')
      setScreen('invite-result')
    })
  }

  async function handleSearch(q: string) {
    setSearchQ(q)
    if (q.length < 2) { setResults([]); return }
    setSearching(true)
    const res = await searchUsersAction(q)
    setResults(res)
    setSearching(false)
  }

  function handleChallenge(opponentId: string) {
    setError('')
    startTransition(async () => {
      const res = await createDuelAction({ type: 'challenge', opponentId })
      if (res.error) { setError(res.error); return }
      router.push(`/duelo/${res.duelId}`)
    })
  }

  function handleJoinByCode() {
    if (!codeInput.trim()) return
    setError('')
    startTransition(async () => {
      const res = await joinDuelByCodeAction(codeInput)
      if (res.error) { setError(res.error); return }
      router.push(`/duelo/${res.duelId}`)
    })
  }

  return (
    <div className="animate-fade-in max-w-lg mx-auto">

      {/* Back */}
      <Link href="/duelo" className="inline-flex items-center gap-1 text-sm text-matema-muted hover:text-matema-dark transition-colors mb-6">
        ← Duelos
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <NinjaIcon className="w-8 h-8 text-matema-accent" strokeWidth={1.5} />
        <h1 className="text-xl font-extrabold text-matema-dark">
          {screen === 'menu'         && 'Novo Duelo'}
          {screen === 'invite'       && 'Entrar por Código'}
          {screen === 'search'       && 'Desafiar Jogador'}
          {screen === 'invite-result' && 'Link de Convite'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* ── Main menu ── */}
      {screen === 'menu' && (
        <div className="space-y-3">

          {/* Random */}
          <button
            onClick={handleRandom}
            disabled={pending}
            className="w-full flex items-center gap-4 bg-white rounded-2xl border-2 border-matema-primary/30 p-4 hover:border-matema-primary/60 transition-colors text-left disabled:opacity-60"
          >
            <div className="w-10 h-10 bg-matema-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              {pending ? <Loader2 className="w-5 h-5 text-matema-primary animate-spin" /> : <Shuffle className="w-5 h-5 text-matema-primary" strokeWidth={1.75} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-matema-dark text-sm">Aleatório</p>
              <p className="text-xs text-matema-muted">Entra numa partida aberta ou cria uma nova</p>
            </div>
            <ChevronRight className="w-4 h-4 text-matema-muted flex-shrink-0" strokeWidth={2} />
          </button>

          {/* Generate link */}
          <button
            onClick={handleGenerateLink}
            disabled={pending}
            className="w-full flex items-center gap-4 bg-white rounded-2xl border-2 border-matema-accent/30 p-4 hover:border-matema-accent/60 transition-colors text-left disabled:opacity-60"
          >
            <div className="w-10 h-10 bg-matema-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
              {pending ? <Loader2 className="w-5 h-5 text-matema-accent animate-spin" /> : <Link2 className="w-5 h-5 text-matema-accent" strokeWidth={1.75} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-matema-dark text-sm">Gerar Link / Código</p>
              <p className="text-xs text-matema-muted">Compartilhe com quem quiser</p>
            </div>
            <ChevronRight className="w-4 h-4 text-matema-muted flex-shrink-0" strokeWidth={2} />
          </button>

          {/* Enter code */}
          <button
            onClick={() => setScreen('invite')}
            className="w-full flex items-center gap-4 bg-white rounded-2xl border-2 border-amber-300/50 p-4 hover:border-amber-400/70 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Link2 className="w-5 h-5 text-amber-600" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-matema-dark text-sm">Entrar por Código</p>
              <p className="text-xs text-matema-muted">Já tem o código do duelo? Entre aqui</p>
            </div>
            <ChevronRight className="w-4 h-4 text-matema-muted flex-shrink-0" strokeWidth={2} />
          </button>

          {/* Search + challenge */}
          <button
            onClick={() => setScreen('search')}
            className="w-full flex items-center gap-4 bg-white rounded-2xl border-2 border-matema-secondary/30 p-4 hover:border-matema-secondary/60 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-matema-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <UserSearch className="w-5 h-5 text-matema-secondary" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-matema-dark text-sm">Desafiar Jogador</p>
              <p className="text-xs text-matema-muted">Busque pelo nome de usuário</p>
            </div>
            <ChevronRight className="w-4 h-4 text-matema-muted flex-shrink-0" strokeWidth={2} />
          </button>

        </div>
      )}

      {/* ── Enter invite code ── */}
      {screen === 'invite' && (
        <div className="bg-white rounded-3xl border border-matema-border p-6 space-y-4">
          <p className="text-sm text-matema-muted">Digite o código de 6 letras do duelo:</p>
          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase().trim().slice(0, 6))}
            placeholder="ABC123"
            className="w-full font-mono text-2xl font-extrabold text-center tracking-widest border-2 border-matema-border rounded-2xl py-3 px-4 uppercase focus:outline-none focus:border-matema-accent text-matema-dark bg-matema-cream"
            maxLength={6}
          />
          <button
            onClick={handleJoinByCode}
            disabled={pending || codeInput.length < 6}
            className="w-full bg-matema-accent text-white font-bold py-3 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            Entrar no Duelo
          </button>
          <button onClick={() => setScreen('menu')} className="w-full text-sm text-matema-muted hover:text-matema-dark transition-colors py-2">
            ← Voltar
          </button>
        </div>
      )}

      {/* ── Invite code result ── */}
      {screen === 'invite-result' && inviteCode && (
        <div className="bg-white rounded-3xl border border-matema-border p-6 text-center space-y-4">
          <p className="text-sm text-matema-muted">Compartilhe este código com seu oponente:</p>
          <div className="bg-matema-cream border-2 border-matema-accent/30 rounded-2xl py-4">
            <p className="font-mono text-4xl font-extrabold text-matema-dark tracking-[0.3em]">{inviteCode}</p>
          </div>
          <p className="text-xs text-matema-muted">
            Ou compartilhe o link: <span className="font-mono font-bold text-matema-dark break-all">
              {typeof window !== 'undefined' ? window.location.origin : ''}/duelo/entrar/{inviteCode}
            </span>
          </p>
          <p className="text-xs text-matema-muted">O duelo expira em 7 dias.</p>
          <button
            onClick={() => router.push('/duelo')}
            className="w-full bg-matema-accent text-white font-bold py-3 rounded-2xl hover:opacity-90 transition-opacity"
          >
            Ver meus duelos
          </button>
        </div>
      )}

      {/* ── User search ── */}
      {screen === 'search' && (
        <div className="space-y-4">
          <div className="relative">
            <UserSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-matema-muted" strokeWidth={1.75} />
            <input
              type="text"
              value={searchQ}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar por nome ou usuário..."
              autoFocus
              className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-matema-border focus:outline-none focus:border-matema-accent bg-white text-matema-dark text-sm"
            />
          </div>

          {searching && (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 text-matema-muted animate-spin" />
            </div>
          )}

          {!searching && results.length === 0 && searchQ.length >= 2 && (
            <p className="text-center text-sm text-matema-muted py-6">Nenhum jogador encontrado.</p>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((u) => (
                <div key={u.id} className="flex items-center gap-3 bg-white rounded-2xl border border-matema-border p-3">
                  <div className="w-9 h-9 bg-matema-accent/10 rounded-full flex items-center justify-center text-sm font-extrabold text-matema-accent flex-shrink-0">
                    {u.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-matema-dark text-sm truncate">{u.displayName}</p>
                    <p className="text-xs text-matema-muted">@{u.username} · Nível {u.level} · Rating {u.duelRating}</p>
                  </div>
                  <button
                    onClick={() => handleChallenge(u.id)}
                    disabled={pending}
                    className={cn(
                      'text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex-shrink-0 flex items-center gap-1',
                      'bg-matema-accent text-white hover:opacity-90 disabled:opacity-50',
                    )}
                  >
                    {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <NinjaIcon className="w-3 h-3" />}
                    Desafiar
                  </button>
                </div>
              ))}
            </div>
          )}

          {results.length === 0 && searchQ.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-10 h-10 text-matema-border mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-sm text-matema-muted">Digite pelo menos 2 caracteres para buscar</p>
            </div>
          )}

          <button onClick={() => setScreen('menu')} className="w-full text-sm text-matema-muted hover:text-matema-dark transition-colors py-2">
            ← Voltar
          </button>
        </div>
      )}
    </div>
  )
}
