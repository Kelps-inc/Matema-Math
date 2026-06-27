import { createClient } from '@/infrastructure/supabase/server'
import { redirect } from 'next/navigation'
import { LeaderboardClient } from './LeaderboardClient'
import type { EloTier } from '@/domain/user/entities/User'
import type { AvatarConfig } from '@/presentation/components/avatar/AvatarConfig'
import { DEFAULT_AVATAR_CONFIG } from '@/presentation/components/avatar/AvatarConfig'

export interface LeaderboardEntry {
  id: string
  displayName: string
  eloTier: EloTier
  eloDivision: number
  eloLp: number
  rank: number
  isCurrentUser: boolean
  // Nivelamento
  placementScore:    number | null
  placementAccuracy: number | null
  placementCorrect:  number | null
  placementTotal:    number | null
  // Ranqueada por dificuldade
  rankedEasy:   { correct: number; total: number }
  rankedMedium: { correct: number; total: number }
  rankedHard:   { correct: number; total: number }
  // Duelo
  duelRating: number
  duelWins:   number
  duelLosses: number
  // Avatar
  avatarConfig: AvatarConfig
}

const TIER_RANK: Record<string, number> = {
  mestre: 6, diamante: 5, platina: 4, ouro: 3, prata: 2, bronze: 1,
}

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const [profilesResult, answersResult, avatarsResult] = await Promise.all([
    sb.from('user_profiles')
      .select('id, display_name, elo_tier, elo_division, elo_lp, placement_result, duel_rating, duel_wins, duel_losses')
      .eq('placement_completed', true),

    sb.from('user_exercise_answers')
      .select('user_id, is_correct, is_skipped, exercises(difficulty)')
      .eq('is_ranked', true),

    sb.from('user_avatar_config')
      .select('user_id, skin_tone, eye_color, eye_style, nose_style, brow_style, mouth_style, body_type, height_type, hair_style, hair_color, gender'),
  ])

  // ── Build avatar map ─────────────────────────────────────────────────────
  const avatarMap: Record<string, AvatarConfig> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const r of (avatarsResult.data ?? []) as any[]) {
    avatarMap[r.user_id] = {
      skinTone:   r.skin_tone,
      eyeColor:   r.eye_color,
      eyeStyle:   r.eye_style,
      noseStyle:  r.nose_style,
      browStyle:  r.brow_style,
      mouthStyle: r.mouth_style,
      bodyType:   r.body_type,
      heightType: r.height_type,
      hairStyle:  r.hair_style  ?? 'curto',
      hairColor:  r.hair_color  ?? 'castanho',
      gender:     r.gender      ?? 'masculino',
    }
  }

  // ── Build ranked stats map ────────────────────────────────────────────────
  const statsMap: Record<string, {
    easy:   { correct: number; total: number }
    medium: { correct: number; total: number }
    hard:   { correct: number; total: number }
  }> = {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const a of (answersResult.data ?? []) as any[]) {
    const diff = a.exercises?.difficulty as 'easy' | 'medium' | 'hard' | undefined
    if (!diff || a.is_skipped) continue
    if (!statsMap[a.user_id]) {
      statsMap[a.user_id] = {
        easy:   { correct: 0, total: 0 },
        medium: { correct: 0, total: 0 },
        hard:   { correct: 0, total: 0 },
      }
    }
    statsMap[a.user_id][diff].total++
    if (a.is_correct) statsMap[a.user_id][diff].correct++
  }

  // ── Sort by elo rank ──────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = ((profilesResult.data ?? []) as any[]).sort((a, b) => {
    const tierDiff = (TIER_RANK[b.elo_tier] ?? 0) - (TIER_RANK[a.elo_tier] ?? 0)
    if (tierDiff !== 0) return tierDiff
    const divDiff = a.elo_division - b.elo_division
    if (divDiff !== 0) return divDiff
    return b.elo_lp - a.elo_lp
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entries: LeaderboardEntry[] = rows.map((row: any, i: number) => {
    const pr = row.placement_result
    const stats = statsMap[row.id] ?? {
      easy:   { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard:   { correct: 0, total: 0 },
    }
    return {
      id:               row.id,
      displayName:      row.display_name,
      eloTier:          row.elo_tier as EloTier,
      eloDivision:      row.elo_division,
      eloLp:            row.elo_lp,
      rank:             i + 1,
      isCurrentUser:    row.id === user.id,
      placementScore:   pr?.score    ?? null,
      placementAccuracy:pr?.accuracy ?? null,
      placementCorrect: pr?.correct  ?? null,
      placementTotal:   pr?.total    ?? null,
      rankedEasy:       stats.easy,
      rankedMedium:     stats.medium,
      rankedHard:       stats.hard,
      duelRating:       row.duel_rating  ?? 1000,
      duelWins:         row.duel_wins    ?? 0,
      duelLosses:       row.duel_losses  ?? 0,
      avatarConfig:     avatarMap[row.id] ?? DEFAULT_AVATAR_CONFIG,
    }
  })

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-matema-dark mb-1">Leaderboard</h1>
        <p className="text-sm text-matema-muted">
          {entries.length} jogador{entries.length !== 1 ? 'es' : ''} classificado{entries.length !== 1 ? 's' : ''}
        </p>
      </div>
      <LeaderboardClient entries={entries} />
    </div>
  )
}
