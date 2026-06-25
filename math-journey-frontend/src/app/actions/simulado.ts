'use server'

import { createClient } from '@/infrastructure/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { EloTier } from '@/domain/user/entities/User'

export type SimuladoSessionData = {
  exerciseIds: string[]
  answers: Record<string, string>
  timeRemainingMs: number
}

export async function getSimuladoSessionAction(): Promise<SimuladoSessionData | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await (supabase as any)
    .from('simulado_sessions')
    .select('exercise_ids, answers, time_remaining_ms')
    .eq('user_id', user.id)
    .single()

  if (!data) return null

  return {
    exerciseIds: data.exercise_ids ?? [],
    answers:     data.answers ?? {},
    timeRemainingMs: data.time_remaining_ms ?? 9900000,
  }
}

export async function upsertSimuladoSessionAction(data: SimuladoSessionData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await (supabase as any)
    .from('simulado_sessions')
    .upsert({
      user_id:          user.id,
      exercise_ids:     data.exerciseIds,
      answers:          data.answers,
      time_remaining_ms: data.timeRemainingMs,
      updated_at:       new Date().toISOString(),
    }, { onConflict: 'user_id' })
}

export async function deleteSimuladoSessionAction(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await (supabase as any)
    .from('simulado_sessions')
    .delete()
    .eq('user_id', user.id)
}

const TIER_ORDER: EloTier[] = ['bronze', 'prata', 'ouro', 'platina', 'diamante', 'mestre']

export async function abandonSimuladoAction(): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return { error: 'Não autenticado' }

  const supabaseAny = supabase as any

  const { data: profile } = await supabaseAny
    .from('user_profiles')
    .select('elo_tier, elo_division, elo_lp')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Perfil não encontrado' }

  let lp       = (profile.elo_lp       ?? 0) - 5
  let tierIdx  = TIER_ORDER.indexOf((profile.elo_tier ?? 'bronze') as EloTier)
  let div      = profile.elo_division ?? 4

  while (lp < 0) {
    if (tierIdx === 0 && div >= 4) { lp = 0; break }
    div++
    if (div > 4) { tierIdx = Math.max(tierIdx - 1, 0); div = 1 }
    lp += 100
  }

  await supabaseAny
    .from('user_profiles')
    .update({
      elo_tier:     TIER_ORDER[tierIdx],
      elo_division: div,
      elo_lp:       lp,
      updated_at:   new Date().toISOString(),
    })
    .eq('id', user.id)

  revalidatePath('/ranqueada')
  revalidatePath('/dashboard')
  redirect('/ranqueada')
}
