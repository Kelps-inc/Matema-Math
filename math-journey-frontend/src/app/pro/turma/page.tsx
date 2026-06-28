import { createClient } from '@/infrastructure/supabase/server'
import { redirect } from 'next/navigation'
import { TurmaClient } from './TurmaClient'

export const metadata = { title: 'Matema Pro — Plano Turma' }

export default async function TurmaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  return <TurmaClient />
}
