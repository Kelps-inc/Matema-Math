import { createClient } from '@/infrastructure/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NinjaIcon } from '@/presentation/components/game/NinjaIcon'
import { DuelPlayer } from '@/presentation/components/game/DuelPlayer'
import { getDuelAction } from '@/app/actions/duelo'
import { MathText } from '@/presentation/components/ui/MathText'
import { CheckCircle2, XCircle, Minus, Clock, Share2 } from 'lucide-react'
import { cn } from '@/presentation/lib/utils'

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E']

export default async function DueloIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const result = await getDuelAction(id)

  if (result.error || !result.duel) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 animate-fade-in">
        <p className="text-matema-muted font-semibold mb-4">{result.error ?? 'Duelo não encontrado.'}</p>
        <Link href="/duelo" className="inline-block bg-matema-accent text-white font-bold px-6 py-3 rounded-2xl hover:opacity-90">
          ← Voltar aos duelos
        </Link>
      </div>
    )
  }

  const { duel, exercises = [], myRole, myAnswers = {}, myDuelRating = 1000, opponentDuelRating = 1000 } = result

  const isChallenger = myRole === 'challenger'
  const myName    = isChallenger ? duel.challengerName : (duel.opponentName ?? 'Você')
  const otherName = isChallenger ? (duel.opponentName  ?? 'Aguardando...') : duel.challengerName

  const myPlayed    = isChallenger ? !!duel.challengerPlayedAt : !!duel.opponentPlayedAt
  const otherPlayed = isChallenger ? !!duel.opponentPlayedAt   : !!duel.challengerPlayedAt

  const myCorrect    = isChallenger ? (duel.challengerCorrect ?? 0) : (duel.opponentCorrect ?? 0)
  const otherCorrect = isChallenger ? (duel.opponentCorrect   ?? 0) : (duel.challengerCorrect ?? 0)

  const myRatingChange    = isChallenger ? duel.challengerRatingChange : duel.opponentRatingChange
  const iWon  = duel.winnerId === user.id
  const isDraw = duel.status === 'completed' && duel.winnerId === null

  // ── Pending (waiting for opponent) ──────────────────────────────────────
  if (duel.status === 'pending' && !duel.opponentId) {
    const inviteUrl = duel.inviteCode
      ? `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/duelo/entrar/${duel.inviteCode}`
      : null

    return (
      <div className="max-w-lg mx-auto animate-fade-in">
        <Link href="/duelo" className="inline-flex items-center gap-1 text-sm text-matema-muted hover:text-matema-dark mb-6 transition-colors">
          ← Duelos
        </Link>
        <div className="bg-white rounded-3xl border border-matema-border p-8 text-center">
          <NinjaIcon className="w-14 h-14 text-matema-accent mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="text-lg font-extrabold text-matema-dark mb-2">Aguardando oponente</h2>
          <p className="text-sm text-matema-muted mb-6">Compartilhe o código abaixo para alguém entrar no duelo.</p>

          {duel.inviteCode && (
            <>
              <div className="bg-matema-cream rounded-2xl py-4 mb-4">
                <p className="font-mono text-4xl font-extrabold text-matema-dark tracking-[0.3em]">{duel.inviteCode}</p>
              </div>
              {inviteUrl && (
                <p className="text-xs text-matema-muted mb-4 break-all">
                  Link: <span className="font-mono font-bold text-matema-dark">{inviteUrl}</span>
                </p>
              )}
            </>
          )}

          <p className="text-xs text-matema-muted">O duelo expira em {new Date(duel.expiresAt).toLocaleDateString('pt-BR')}.</p>
        </div>
      </div>
    )
  }

  // ── Active & it's my turn ──────────────────────────────────────────────
  if ((duel.status === 'active' || duel.status === 'pending') && !myPlayed) {
    return (
      <div className="animate-fade-in">
        <Link href="/duelo" className="inline-flex items-center gap-1 text-sm text-matema-muted hover:text-matema-dark mb-6 transition-colors">
          ← Duelos
        </Link>
        <DuelPlayer duelId={duel.id} exercises={exercises} opponentName={otherName} />
      </div>
    )
  }

  // ── Active & waiting for opponent ─────────────────────────────────────
  if (duel.status === 'active' && myPlayed && !otherPlayed) {
    return (
      <div className="max-w-lg mx-auto animate-fade-in">
        <Link href="/duelo" className="inline-flex items-center gap-1 text-sm text-matema-muted hover:text-matema-dark mb-6 transition-colors">
          ← Duelos
        </Link>
        <div className="bg-white rounded-3xl border border-matema-border p-8 text-center">
          <Clock className="w-14 h-14 text-matema-accent mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="text-lg font-extrabold text-matema-dark mb-2">Você já jogou!</h2>
          <p className="text-sm text-matema-muted">
            Aguardando <strong>{otherName}</strong> responder as questões. O resultado aparecerá aqui quando o duelo terminar.
          </p>
          <p className="text-xs text-matema-muted mt-4">Você acertou <strong>{myCorrect}/7</strong> questões.</p>
        </div>
      </div>
    )
  }

  // ── Completed — show result ─────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <Link href="/duelo" className="inline-flex items-center gap-1 text-sm text-matema-muted hover:text-matema-dark mb-6 transition-colors">
        ← Duelos
      </Link>

      {/* Result banner */}
      <div className={cn(
        'rounded-3xl p-6 mb-6 text-center border-2',
        iWon  ? 'bg-green-50  border-green-200'
        : isDraw ? 'bg-gray-50   border-matema-border'
        :          'bg-red-50    border-red-200',
      )}>
        <p className="text-4xl mb-2">{iWon ? '🏆' : isDraw ? '🤝' : '😤'}</p>
        <h2 className={cn('text-2xl font-extrabold mb-1', iWon ? 'text-matema-secondary' : isDraw ? 'text-matema-dark' : 'text-red-600')}>
          {iWon ? 'Você venceu!' : isDraw ? 'Empate!' : 'Você perdeu'}
        </h2>
        <div className="flex items-center justify-center gap-4 mt-3 mb-2">
          <div className="text-center">
            <p className="text-3xl font-extrabold text-matema-dark tabular-nums">{myCorrect}</p>
            <p className="text-xs text-matema-muted font-semibold">{myName}</p>
          </div>
          <p className="text-matema-muted font-bold">vs</p>
          <div className="text-center">
            <p className="text-3xl font-extrabold text-matema-dark tabular-nums">{otherCorrect}</p>
            <p className="text-xs text-matema-muted font-semibold">{otherName}</p>
          </div>
        </div>
        {myRatingChange != null && (
          <p className={cn('text-sm font-bold', myRatingChange >= 0 ? 'text-matema-secondary' : 'text-red-500')}>
            Rating: {myDuelRating} → {myDuelRating + myRatingChange}
            {' '}({myRatingChange >= 0 ? '+' : ''}{myRatingChange})
          </p>
        )}
      </div>

      {/* Question-by-question breakdown */}
      <h3 className="font-bold text-matema-dark mb-3 text-sm uppercase tracking-wider">Gabarito</h3>
      <div className="space-y-3">
        {exercises.map((ex, i) => {
          const myAns    = myAnswers[ex.id] ?? null
          const options  = ex.options ?? []
          const myIdx    = options.indexOf(myAns ?? '')
          const corrIdx  = options.indexOf(ex.correct_answer)
          const wasRight = myAns === ex.correct_answer

          return (
            <div key={ex.id} className="bg-white rounded-2xl border border-matema-border p-4">
              <div className="flex items-start gap-2 mb-2">
                {wasRight
                  ? <CheckCircle2 className="w-4 h-4 text-matema-secondary flex-shrink-0 mt-0.5" strokeWidth={2} />
                  : <XCircle      className="w-4 h-4 text-red-500        flex-shrink-0 mt-0.5" strokeWidth={2} />
                }
                <p className="text-xs font-semibold text-matema-dark leading-snug">
                  Q{i + 1} · <MathText>{ex.question.length > 100 ? ex.question.slice(0, 100) + '...' : ex.question}</MathText>
                </p>
              </div>
              <div className="flex gap-3 text-xs">
                <span className={cn('flex items-center gap-1', wasRight ? 'text-matema-secondary' : 'text-red-500')}>
                  <span className="font-extrabold">{OPTION_LETTERS[myIdx] ?? '—'}</span>
                  <span className="text-matema-muted">(sua)</span>
                </span>
                {!wasRight && (
                  <span className="flex items-center gap-1 text-matema-secondary">
                    <span className="font-extrabold">{OPTION_LETTERS[corrIdx] ?? '?'}</span>
                    <span className="text-matema-muted">(certa)</span>
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Link
        href="/duelo"
        className="mt-6 w-full flex items-center justify-center gap-2 bg-matema-accent text-white font-bold py-4 rounded-3xl hover:opacity-90 transition-opacity"
      >
        <NinjaIcon className="w-5 h-5" />
        Novo desafio
      </Link>
    </div>
  )
}
