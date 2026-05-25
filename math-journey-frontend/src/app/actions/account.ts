'use server'

import { createClient } from '@/infrastructure/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function resetProgressAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  await db.from('user_lesson_progress').delete().eq('user_id', user.id)
  await db.from('user_exercise_answers').delete().eq('user_id', user.id)
  await db.from('user_profiles').update({
    xp: 0, level: 1, coins: 50, streak_days: 0,
  }).eq('id', user.id)

  revalidatePath('/dashboard')
  revalidatePath('/modulos')
  return { success: true }
}

export async function deleteAccountAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  await db.from('user_inventory').delete().eq('user_id', user.id)
  await db.from('user_avatar_config').delete().eq('user_id', user.id)
  await db.from('user_lesson_progress').delete().eq('user_id', user.id)
  await db.from('user_exercise_answers').delete().eq('user_id', user.id)
  await db.from('user_profiles').delete().eq('id', user.id)

  // Deletar da auth (requer SUPABASE_SERVICE_ROLE_KEY nas env vars do Vercel)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (serviceKey) {
    const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)
    await admin.auth.admin.deleteUser(user.id)
  }

  await supabase.auth.signOut()
  redirect('/entrar')
}
