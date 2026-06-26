import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/infrastructure/supabase/server'

const TIER_ORDER = ['bronze', 'prata', 'ouro', 'platina', 'diamante', 'mestre'] as const
type Tier = typeof TIER_ORDER[number]

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabaseAny = supabase as any

  // Parse body (best effort)
  let exerciseIds: string[] = []
  let answers: Record<string, string> = {}
  let timeRemainingMs = 0
  try {
    const body = await req.json()
    exerciseIds    = body.exerciseIds    ?? []
    answers        = body.answers        ?? {}
    timeRemainingMs = body.timeRemainingMs ?? 0
  } catch {}

  // Save session
  if (exerciseIds.length > 0) {
    await supabaseAny.from('simulado_sessions').upsert({
      user_id:          user.id,
      exercise_ids:     exerciseIds,
      answers,
      time_remaining_ms: timeRemainingMs,
      updated_at:       new Date().toISOString(),
    }, { onConflict: 'user_id' })
  }

  // Apply −5 PDL
  const { data: profile } = await supabaseAny
    .from('user_profiles')
    .select('elo_tier, elo_division, elo_lp')
    .eq('id', user.id)
    .single()

  if (profile) {
    let lp      = (profile.elo_lp ?? 0) - 5
    let tierIdx = TIER_ORDER.indexOf((profile.elo_tier ?? 'bronze') as Tier)
    let div     = profile.elo_division ?? 4

    while (lp < 0) {
      if (tierIdx === 0 && div >= 4) { lp = 0; break }
      div++
      if (div > 4) { tierIdx = Math.max(tierIdx - 1, 0); div = 1 }
      lp += 100
    }

    await supabaseAny.from('user_profiles').update({
      elo_tier:     TIER_ORDER[tierIdx],
      elo_division: div,
      elo_lp:       lp,
      updated_at:   new Date().toISOString(),
    }).eq('id', user.id)
  }

  return NextResponse.json({ ok: true })
}
