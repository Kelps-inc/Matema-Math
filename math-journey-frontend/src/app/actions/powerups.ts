'use server'

import { createClient } from '@/infrastructure/supabase/server'

/* eslint-disable @typescript-eslint/no-explicit-any */

// Nomes canônicos dos power-ups (devem bater com shop_items.name).
export const POWERUP_NAMES = {
  bomba:  'Bomba',
  heart:  'Coração',
  double: 'Multiplicador 2x',
} as const

export type PowerupKey = keyof typeof POWERUP_NAMES

export interface MyPowerups {
  // itemId por chave + quantidade em mãos
  bomba:  { itemId: string | null; qty: number }
  heart:  { itemId: string | null; qty: number }
  double: { itemId: string | null; qty: number }
}

const EMPTY: MyPowerups = {
  bomba:  { itemId: null, qty: 0 },
  heart:  { itemId: null, qty: 0 },
  double: { itemId: null, qty: 0 },
}

/** Resolve os item_ids dos 3 power-ups (sempre os mesmos para todos). */
async function resolvePowerupIds(db: any): Promise<Record<PowerupKey, string | null>> {
  const { data } = await db
    .from('shop_items')
    .select('id, name')
    .eq('category', 'powerup')

  const byName: Record<string, string> = {}
  for (const r of (data ?? [])) byName[r.name] = r.id

  return {
    bomba:  byName[POWERUP_NAMES.bomba]  ?? null,
    heart:  byName[POWERUP_NAMES.heart]  ?? null,
    double: byName[POWERUP_NAMES.double] ?? null,
  }
}

/** Quantidades de power-ups do usuário (para a tela de jogo). */
export async function getMyPowerupsAction(): Promise<MyPowerups> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return EMPTY
  const db = supabase as any

  const ids = await resolvePowerupIds(db)
  const allIds = [ids.bomba, ids.heart, ids.double].filter(Boolean) as string[]
  if (allIds.length === 0) return EMPTY

  const { data: inv } = await db
    .from('user_inventory')
    .select('item_id, quantity')
    .eq('user_id', user.id)
    .in('item_id', allIds)

  const qtyById: Record<string, number> = {}
  for (const r of (inv ?? [])) qtyById[r.item_id] = r.quantity ?? 0

  return {
    bomba:  { itemId: ids.bomba,  qty: ids.bomba  ? (qtyById[ids.bomba]  ?? 0) : 0 },
    heart:  { itemId: ids.heart,  qty: ids.heart  ? (qtyById[ids.heart]  ?? 0) : 0 },
    double: { itemId: ids.double, qty: ids.double ? (qtyById[ids.double] ?? 0) : 0 },
  }
}

const norm = (v: string) => v.trim().toLowerCase()

/**
 * Bomba: consome 1 e devolve 2 alternativas ERRADAS para eliminar.
 * Só faz sentido em múltipla escolha com ≥4 opções.
 */
export async function useRankedBombaAction(exerciseId: string): Promise<
  { eliminated: string[]; remaining: number } | { error: string }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }
  const db = supabase as any

  const { data: ex } = await db
    .from('exercises')
    .select('type, options, correct_answer')
    .eq('id', exerciseId)
    .single()

  if (!ex) return { error: 'Questão não encontrada' }
  const options: string[] = ex.options ?? []
  if (ex.type !== 'multiple_choice' || options.length < 4) {
    return { error: 'Bomba indisponível nesta questão' }
  }

  const ids = await resolvePowerupIds(db)
  if (!ids.bomba) return { error: 'Power-up indisponível' }

  const { data: res } = await db.rpc('consume_powerup', { p_user_id: user.id, p_item_id: ids.bomba })
  if (!res?.success) return { error: 'Você não tem este power-up' }

  // Escolhe 2 erradas aleatórias
  const wrong = options.filter((o) => norm(o) !== norm(ex.correct_answer))
  for (let i = wrong.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[wrong[i], wrong[j]] = [wrong[j], wrong[i]]
  }
  return { eliminated: wrong.slice(0, 2), remaining: res.remaining ?? 0 }
}

export interface RankedVerdict {
  isCorrect: boolean
  correctAnswer?: string  // omitido quando há 2ª chance (não revela o gabarito)
  secondChance?: boolean
}

/**
 * Valida a resposta da ranqueada no servidor. Se errar com o Coração armado e
 * disponível, consome o power-up e concede 2ª chance SEM revelar o gabarito.
 */
export async function submitRankedAnswerAction(
  exerciseId: string,
  answer: string,
  heartArmed: boolean,
): Promise<RankedVerdict | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }
  const db = supabase as any

  const { data: ex } = await db
    .from('exercises')
    .select('correct_answer')
    .eq('id', exerciseId)
    .single()
  if (!ex) return { error: 'Questão não encontrada' }

  const isCorrect = norm(answer) === norm(ex.correct_answer)
  if (isCorrect) return { isCorrect: true, correctAnswer: ex.correct_answer }

  if (heartArmed) {
    const ids = await resolvePowerupIds(db)
    if (ids.heart) {
      const { data: res } = await db.rpc('consume_powerup', { p_user_id: user.id, p_item_id: ids.heart })
      if (res?.success) {
        return { isCorrect: false, secondChance: true }
      }
    }
  }

  return { isCorrect: false, correctAnswer: ex.correct_answer }
}
