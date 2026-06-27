import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase com SERVICE ROLE — bypassa RLS.
 *
 * ⚠️ Uso EXCLUSIVO em contexto de servidor confiável SEM sessão de usuário
 * (ex.: webhook do AbacatePay, que precisa atualizar o perfil de quem pagou).
 * NUNCA importe isto em Client Components — `SUPABASE_SERVICE_ROLE_KEY` é um
 * segredo de servidor e jamais deve chegar ao browser. Ver regra de RLS em
 * `skills/002-architecture-rules.md` e ADR-013.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_URL ausente')
  }
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
