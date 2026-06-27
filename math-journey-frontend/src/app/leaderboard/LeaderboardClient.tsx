'use client'

import { useState, useRef } from 'react'
import { Avatar } from '@/presentation/components/avatar/Avatar'
import { EloTierIcon } from '@/presentation/components/ui/EloTierIcon'
import { ELO_TIER_LABELS } from '@/domain/user/entities/User'
import type { LeaderboardEntry } from './page'

const DIV_LABELS = ['', 'I', 'II', 'III', 'IV']

function pct(correct: number, total: number): number | null {
  return total > 0 ? Math.round((correct / total) * 100) : null
}

function AccuracyBar({ label, correct, total, color }: {
  label: string; correct: number; total: number; color: string
}) {
  const p = pct(correct, total)
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-12 text-matema-muted shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-matema-border rounded-full overflow-hidden">
        {p !== null && <div className={`h-full rounded-full ${color}`} style={{ width: `${p}%` }} />}
      </div>
      <span className="w-8 text-right font-semibold text-matema-dark shrink-0">
        {p !== null ? `${p}%` : '—'}
      </span>
      <span className="text-matema-muted shrink-0">({total})</span>
    </div>
  )
}

function HoverCard({ entry }: { entry: LeaderboardEntry }) {
  const divLabel = entry.eloTier !== 'mestre' ? ` ${DIV_LABELS[entry.eloDivision] ?? ''}` : ''
  const rankedTotal   = entry.rankedEasy.total   + entry.rankedMedium.total   + entry.rankedHard.total
  const rankedCorrect = entry.rankedEasy.correct + entry.rankedMedium.correct + entry.rankedHard.correct
  const overallPct = pct(rankedCorrect, rankedTotal)
  const duelTotal  = entry.duelWins + entry.duelLosses
  const winRate    = duelTotal > 0 ? Math.round((entry.duelWins / duelTotal) * 100) : null

  return (
    <div className="w-72 bg-white rounded-2xl shadow-2xl border border-matema-border p-4">
      {/* Avatar + nome */}
      <div className="flex items-start gap-3 mb-3">
        <div className="shrink-0">
          <Avatar config={entry.avatarConfig} size={64} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-matema-dark leading-tight truncate">{entry.displayName}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <EloTierIcon tier={entry.eloTier} size="w-4 h-4" />
            <span className="text-sm text-matema-muted">
              {ELO_TIER_LABELS[entry.eloTier]}{divLabel} · {entry.eloLp} PDL
            </span>
          </div>
        </div>
      </div>

      {/* Nivelamento */}
      {entry.placementAccuracy !== null && (
        <div className="border-t border-matema-border pt-3 mb-3">
          <p className="text-xs font-semibold text-matema-muted uppercase tracking-wide mb-2">
            Teste de Nivelamento
          </p>
          <div className="flex gap-4">
            <div>
              <p className="text-xl font-extrabold text-matema-dark leading-none">{entry.placementAccuracy}%</p>
              <p className="text-xs text-matema-muted mt-0.5">Precisão</p>
            </div>
            <div>
              <p className="text-xl font-extrabold text-matema-dark leading-none">{entry.placementCorrect}/{entry.placementTotal}</p>
              <p className="text-xs text-matema-muted mt-0.5">Acertos</p>
            </div>
            {entry.placementScore !== null && (
              <div>
                <p className="text-xl font-extrabold text-matema-dark leading-none">{entry.placementScore}</p>
                <p className="text-xs text-matema-muted mt-0.5">Score</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Precisão ranqueada */}
      <div className="border-t border-matema-border pt-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-matema-muted uppercase tracking-wide">Precisão Ranqueada</p>
          {overallPct !== null && (
            <span className="text-xs font-bold text-matema-primary">{overallPct}% geral</span>
          )}
        </div>
        {rankedTotal === 0 ? (
          <p className="text-xs text-matema-muted">Nenhuma partida ainda</p>
        ) : (
          <div className="space-y-2">
            <AccuracyBar label="Fácil"   correct={entry.rankedEasy.correct}   total={entry.rankedEasy.total}   color="bg-green-500" />
            <AccuracyBar label="Médio"   correct={entry.rankedMedium.correct} total={entry.rankedMedium.total} color="bg-amber-500" />
            <AccuracyBar label="Difícil" correct={entry.rankedHard.correct}   total={entry.rankedHard.total}   color="bg-red-500"   />
          </div>
        )}
      </div>

      {/* Duelo */}
      <div className="border-t border-matema-border pt-3">
        <p className="text-xs font-semibold text-matema-muted uppercase tracking-wide mb-2">Duelo 🥷</p>
        {duelTotal === 0 ? (
          <p className="text-xs text-matema-muted">Nenhum duelo ainda</p>
        ) : (
          <div className="flex gap-4">
            <div>
              <p className="text-xl font-extrabold text-matema-accent leading-none">{entry.duelRating}</p>
              <p className="text-xs text-matema-muted mt-0.5">Rating</p>
            </div>
            <div>
              <p className="text-xl font-extrabold text-matema-dark leading-none">
                <span className="text-green-600">{entry.duelWins}</span>
                <span className="text-matema-muted text-base">/{entry.duelLosses}</span>
              </p>
              <p className="text-xs text-matema-muted mt-0.5">V/D</p>
            </div>
            {winRate !== null && (
              <div>
                <p className="text-xl font-extrabold text-matema-dark leading-none">{winRate}%</p>
                <p className="text-xs text-matema-muted mt-0.5">Win rate</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const RANK_STYLE: Record<number, string> = {
  1: 'text-yellow-500 font-extrabold text-lg',
  2: 'text-slate-400  font-extrabold text-lg',
  3: 'text-orange-600 font-extrabold text-lg',
}

type Tab = 'ranked' | 'duelo'

export function LeaderboardClient({ entries }: { entries: LeaderboardEntry[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [tab, setTab]             = useState<Tab>('ranked')
  const listRef = useRef<HTMLDivElement>(null)

  const hoveredEntry = hoveredId ? entries.find(e => e.id === hoveredId) ?? null : null

  // For duelo tab, re-sort by duel_rating desc
  const duelEntries = [...entries].sort((a, b) => b.duelRating - a.duelRating)
  const visibleEntries = tab === 'ranked' ? entries : duelEntries

  return (
    <div className="flex gap-6 items-start">

      {/* Coluna esquerda: HoverCard (sticky) */}
      <div className="hidden lg:block w-72 shrink-0 sticky top-24">
        {hoveredEntry
          ? <HoverCard entry={hoveredEntry} />
          : (
            <div className="w-72 rounded-2xl border-2 border-dashed border-matema-border p-6 text-center">
              <p className="text-sm font-semibold text-matema-dark mb-1">Detalhes do jogador</p>
              <p className="text-xs text-matema-muted">Passe o mouse sobre um jogador para ver suas estatísticas.</p>
            </div>
          )
        }
      </div>

      {/* Coluna direita */}
      <div ref={listRef} className="flex-1 min-w-0 space-y-2">

        {/* Abas */}
        <div className="flex gap-1 p-1 bg-matema-warm rounded-2xl w-fit mb-4">
          <button
            onClick={() => setTab('ranked')}
            className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-colors ${
              tab === 'ranked'
                ? 'bg-white text-matema-dark shadow-sm'
                : 'text-matema-muted hover:text-matema-dark'
            }`}
          >
            Ranqueada
          </button>
          <button
            onClick={() => setTab('duelo')}
            className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-colors ${
              tab === 'duelo'
                ? 'bg-white text-matema-dark shadow-sm'
                : 'text-matema-muted hover:text-matema-dark'
            }`}
          >
            🥷 Duelo
          </button>
        </div>

        {/* Header */}
        {tab === 'ranked' ? (
          <div className="grid grid-cols-[2rem_1fr_9rem_5rem_5.5rem] gap-4 px-4 text-xs font-semibold text-matema-muted uppercase tracking-wide mb-1">
            <span>#</span>
            <span>Jogador</span>
            <span>Elo</span>
            <span className="text-right hidden sm:block">Partidas</span>
            <span className="text-right hidden sm:block">Precisão</span>
          </div>
        ) : (
          <div className="grid grid-cols-[2rem_1fr_6rem_7rem_5rem] gap-4 px-4 text-xs font-semibold text-matema-muted uppercase tracking-wide mb-1">
            <span>#</span>
            <span>Jogador</span>
            <span>Rating</span>
            <span className="text-center hidden sm:block">V / D</span>
            <span className="text-right hidden sm:block">Win rate</span>
          </div>
        )}

        {visibleEntries.map((entry, idx) => {
          const divLabel      = entry.eloTier !== 'mestre' ? ` ${DIV_LABELS[entry.eloDivision] ?? ''}` : ''
          const rankedTotal   = entry.rankedEasy.total   + entry.rankedMedium.total   + entry.rankedHard.total
          const rankedCorrect = entry.rankedEasy.correct + entry.rankedMedium.correct + entry.rankedHard.correct
          const overallPct    = pct(rankedCorrect, rankedTotal)
          const duelTotal     = entry.duelWins + entry.duelLosses
          const winRate       = duelTotal > 0 ? Math.round((entry.duelWins / duelTotal) * 100) : null
          const displayRank   = tab === 'ranked' ? entry.rank : idx + 1

          return (
            <div
              key={entry.id}
              onMouseEnter={() => setHoveredId(entry.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`
                grid gap-4 items-center
                px-4 py-4 rounded-2xl border transition-colors cursor-default
                ${tab === 'ranked'
                  ? 'grid-cols-[2rem_1fr_9rem_5rem_5.5rem]'
                  : 'grid-cols-[2rem_1fr_6rem_7rem_5rem]'}
                ${entry.isCurrentUser
                  ? 'bg-matema-primary/5 border-matema-primary/30 shadow-sm'
                  : 'bg-white border-matema-border hover:border-matema-primary/30'}
              `}
            >
              {/* Rank */}
              <span className={RANK_STYLE[displayRank] ?? 'text-matema-muted font-semibold'}>
                {displayRank}
              </span>

              {/* Nome */}
              <div className="min-w-0">
                <span className={`font-semibold text-sm leading-none ${entry.isCurrentUser ? 'text-matema-primary' : 'text-matema-dark'}`}>
                  {entry.displayName}
                </span>
                {entry.isCurrentUser && (
                  <span className="ml-2 text-xs bg-matema-primary/10 text-matema-primary font-bold px-1.5 py-0.5 rounded-full">
                    Você
                  </span>
                )}
              </div>

              {tab === 'ranked' ? (
                <>
                  {/* Elo */}
                  <div className="flex items-center gap-1.5 justify-start w-full">
                    <EloTierIcon tier={entry.eloTier} size="w-4 h-4" />
                    <span className="text-sm font-semibold text-matema-dark hidden sm:inline whitespace-nowrap">
                      {ELO_TIER_LABELS[entry.eloTier]}{divLabel}
                    </span>
                    <span className="text-xs text-matema-muted whitespace-nowrap">{entry.eloLp} PDL</span>
                  </div>

                  {/* Partidas */}
                  <span className="text-sm text-matema-muted text-right hidden sm:block w-full">
                    {rankedTotal > 0 ? rankedTotal : '—'}
                  </span>

                  {/* Precisão */}
                  <span className={`text-sm font-semibold text-right hidden sm:block w-full ${overallPct !== null ? 'text-matema-dark' : 'text-matema-muted'}`}>
                    {overallPct !== null ? `${overallPct}%` : '—'}
                  </span>
                </>
              ) : (
                <>
                  {/* Rating */}
                  <span className="text-sm font-extrabold text-matema-accent whitespace-nowrap">
                    {entry.duelRating}
                  </span>

                  {/* V / D */}
                  <span className="text-sm hidden sm:block text-center whitespace-nowrap">
                    {duelTotal > 0 ? (
                      <>
                        <span className="font-bold text-green-600">{entry.duelWins}</span>
                        <span className="text-matema-muted"> / </span>
                        <span className="font-bold text-red-500">{entry.duelLosses}</span>
                      </>
                    ) : (
                      <span className="text-matema-muted">—</span>
                    )}
                  </span>

                  {/* Win rate */}
                  <span className={`text-sm font-semibold text-right hidden sm:block w-full ${winRate !== null ? 'text-matema-dark' : 'text-matema-muted'}`}>
                    {winRate !== null ? `${winRate}%` : '—'}
                  </span>
                </>
              )}
            </div>
          )
        })}

        {entries.length === 0 && (
          <div className="text-center py-20 text-matema-muted">
            Nenhum jogador classificado ainda.
          </div>
        )}
      </div>
    </div>
  )
}
