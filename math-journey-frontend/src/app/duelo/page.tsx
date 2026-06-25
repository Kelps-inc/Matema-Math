import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseUserRepository } from '@/infrastructure/repositories/SupabaseUserRepository'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NinjaIcon } from '@/presentation/components/game/NinjaIcon'
import { getMyDuelsAction } from '@/app/actions/duelo'
import type { DuelSummary } from '@/app/actions/duelo'
import { Clock, CheckCircle2, Hourglass, Trophy } from 'lucide-react'
import { cn } from '@/presentation/lib/utils'

function DuelCard({ duel, myId }: { duel: DuelSummary; myId: string }) {
  const isChallenger = duel.challengerId === myId
  const myName    = isChallenger ? duel.challengerName : (duel.opponentName ?? 'Aguardando...')
  const otherName = isChallenger ? (duel.opponentName  ?? 'Aguardando...') : duel.challengerName

  const myPlayed    = isChallenger ? !!duel.challengerPlayedAt : !!duel.opponentPlayedAt
  const otherPlayed = isChallenger ? !!duel.opponentPlayedAt   : !!duel.challengerPlayedAt

  const iWon = duel.winnerId === myId
  const isDraw = duel.status === 'completed' && duel.winnerId === null

  const myRatingChange    = isChallenger ? duel.challengerRatingChange : duel.opponentRatingChange
  const myCorrect         = isChallenger ? duel.challengerCorrect      : duel.opponentCorrect
  const otherCorrect      = isChallenger ? duel.opponentCorrect        : duel.challengerCorrect

  let statusLabel = ''
  let statusClass = ''

  if (duel.status === 'pending' && !duel.opponentId) {
    statusLabel = 'Aguardando oponente'
    statusClass = 'text-amber-600 bg-amber-50 border-amber-200'
  } else if (duel.status === 'active' && !myPlayed) {
    statusLabel = 'Sua vez!'
    statusClass = 'text-matema-primary bg-matema-primary/10 border-matema-primary/30 font-bold'
  } else if (duel.status === 'active' && myPlayed && !otherPlayed) {
    statusLabel = 'Aguardando oponente'
    statusClass = 'text-matema-accent bg-matema-accent/10 border-matema-accent/30'
  } else if (duel.status === 'completed') {
    if (isDraw)   { statusLabel = 'Empate'; statusClass = 'text-matema-muted bg-gray-50 border-matema-border' }
    else if (iWon){ statusLabel = 'Você venceu!'; statusClass = 'text-matema-secondary bg-green-50 border-green-200' }
    else          { statusLabel = 'Você perdeu'; statusClass = 'text-red-600 bg-red-50 border-red-200' }
  }

  return (
    <Link href={`/duelo/${duel.id}`} className="block bg-white rounded-2xl border border-matema-border p-4 hover:border-matema-accent/40 transition-colors shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <NinjaIcon className="w-5 h-5 text-matema-accent flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-matema-muted leading-none mb-0.5">vs</p>
            <p className="font-bold text-matema-dark text-sm truncate">{otherName}</p>
          </div>
        </div>
        {statusLabel && (
          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap flex-shrink-0', statusClass)}>
            {statusLabel}
          </span>
        )}
      </div>

      {duel.status === 'completed' && (
        <div className="flex items-center gap-2 text-xs text-matema-muted">
          <span className={cn('font-bold tabular-nums', iWon ? 'text-matema-secondary' : isDraw ? '' : 'text-red-500')}>
            {myCorrect ?? 0}/7
          </span>
          <span>vs</span>
          <span className="font-bold tabular-nums">{otherCorrect ?? 0}/7</span>
          {myRatingChange != null && (
            <span className={cn('ml-auto font-bold', myRatingChange >= 0 ? 'text-matema-secondary' : 'text-red-500')}>
              {myRatingChange >= 0 ? '+' : ''}{myRatingChange} rating
            </span>
          )}
        </div>
      )}

      {duel.status === 'pending' && duel.inviteCode && (
        <p className="text-xs text-matema-muted">
          Código: <span className="font-mono font-bold text-matema-dark">{duel.inviteCode}</span>
        </p>
      )}

      {duel.status === 'active' && !myPlayed && (
        <p className="text-xs text-matema-primary font-semibold">Responda suas 7 questões →</p>
      )}

      {duel.status === 'active' && myPlayed && !otherPlayed && (
        <div className="flex items-center gap-1.5 text-xs text-matema-muted">
          <Hourglass className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span>Você já jogou. Aguardando {otherName}...</span>
        </div>
      )}

      <p className="text-[10px] text-matema-muted mt-2">
        {new Date(duel.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
      </p>
    </Link>
  )
}

export default async function DueloPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const userRepo = new SupabaseUserRepository(supabase)
  const profile = await userRepo.findById(user.id)
  if (!profile) redirect('/entrar')

  const { duels, myId } = await getMyDuelsAction()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseAny = supabase as any
  const { data: profileData } = await supabaseAny
    .from('user_profiles')
    .select('duel_rating, duel_wins, duel_losses')
    .eq('id', user.id)
    .single()

  const duelRating = profileData?.duel_rating ?? 1000
  const duelWins   = profileData?.duel_wins   ?? 0
  const duelLosses = profileData?.duel_losses ?? 0

  const active    = duels.filter((d) => d.status === 'pending' || d.status === 'active')
  const completed = duels.filter((d) => d.status === 'completed')

  const myTurn    = active.filter((d) => {
    const isChallenger = d.challengerId === myId
    const myPlayed = isChallenger ? !!d.challengerPlayedAt : !!d.opponentPlayedAt
    return d.status === 'active' && !myPlayed
  })

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-matema-accent/10 rounded-2xl flex items-center justify-center flex-shrink-0">
          <NinjaIcon className="w-7 h-7 text-matema-accent" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-matema-dark leading-none">Duelo</h1>
          <p className="text-sm text-matema-muted">Desafie jogadores em batalhas de 7 questões</p>
        </div>
      </div>

      {/* Rating card */}
      <div className="bg-white rounded-3xl border border-matema-border p-5 mb-6 flex items-center gap-6">
        <div className="text-center flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-matema-muted mb-1">Rating</p>
          <p className="text-3xl font-extrabold text-matema-dark tabular-nums">{duelRating}</p>
        </div>
        <div className="w-px h-12 bg-matema-border" />
        <div className="text-center flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-matema-muted mb-1">Vitórias</p>
          <p className="text-3xl font-extrabold text-matema-secondary tabular-nums">{duelWins}</p>
        </div>
        <div className="w-px h-12 bg-matema-border" />
        <div className="text-center flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-matema-muted mb-1">Derrotas</p>
          <p className="text-3xl font-extrabold text-red-500 tabular-nums">{duelLosses}</p>
        </div>
      </div>

      {/* Alert: it's your turn */}
      {myTurn.length > 0 && (
        <div className="bg-matema-primary/10 border border-matema-primary/30 rounded-2xl px-4 py-3 mb-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-matema-primary flex-shrink-0" strokeWidth={1.75} />
          <p className="text-sm font-bold text-matema-primary">
            {myTurn.length === 1
              ? 'Você tem 1 duelo aguardando sua resposta!'
              : `Você tem ${myTurn.length} duelos aguardando sua resposta!`}
          </p>
        </div>
      )}

      {/* Novo duelo */}
      <Link
        href="/duelo/criar"
        className="flex items-center justify-center gap-3 w-full bg-matema-accent text-white rounded-3xl py-5 mb-6 hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
      >
        <NinjaIcon className="w-6 h-6" strokeWidth={1.5} />
        <span className="text-lg font-extrabold">Novo Duelo</span>
      </Link>

      {/* Active duels */}
      {active.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold text-matema-dark uppercase tracking-wider mb-3 flex items-center gap-2">
            <Hourglass className="w-4 h-4 text-matema-accent" strokeWidth={1.75} />
            Em andamento ({active.length})
          </h2>
          <div className="space-y-3">
            {active.map((d) => <DuelCard key={d.id} duel={d} myId={myId} />)}
          </div>
        </section>
      )}

      {/* Completed duels */}
      {completed.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-matema-dark uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-matema-muted" strokeWidth={1.75} />
            Recentes ({completed.length})
          </h2>
          <div className="space-y-3">
            {completed.slice(0, 10).map((d) => <DuelCard key={d.id} duel={d} myId={myId} />)}
          </div>
        </section>
      )}

      {duels.length === 0 && (
        <div className="text-center py-16">
          <Trophy className="w-12 h-12 text-matema-border mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-matema-muted font-semibold mb-1">Nenhum duelo ainda</p>
          <p className="text-sm text-matema-muted">Crie o primeiro e desafie alguém!</p>
        </div>
      )}
    </div>
  )
}
