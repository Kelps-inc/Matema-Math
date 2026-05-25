'use server'

import { createClient } from '@/infrastructure/supabase/server'
import { revalidatePath } from 'next/cache'

export async function setItemEquippedAction(itemId: string, equipped: boolean) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: { user } } = await (supabase as any).auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('user_inventory')
    .update({ is_equipped: equipped })
    .eq('user_id', user.id)
    .eq('item_id', itemId)

  if (error) return { error: error.message }

  revalidatePath('/loja')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function purchaseItemAction(itemId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('purchase_item', {
    p_user_id: user.id,
    p_item_id: itemId,
  })

  if (error) return { error: error.message }

  const result = data as { success?: boolean; error?: string; newCoins?: number }
  if (result.error) return { error: result.error }

  revalidatePath('/loja')
  revalidatePath('/dashboard')
  return { success: true, newCoins: result.newCoins }
}
