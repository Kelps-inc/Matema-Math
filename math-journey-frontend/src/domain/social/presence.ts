/**
 * Presença "online" — camada de domínio, pura (sem Supabase/Next/React).
 *
 * Online = atividade recente (heartbeat grava `last_active_at`). Sem Realtime;
 * a UI faz polling leve. Limite curto para refletir presença de verdade.
 */
export const ONLINE_WINDOW_MS = 2 * 60 * 1000 // 2 minutos

export function isOnline(lastActiveAt: string | Date | null, now: number = Date.now()): boolean {
  if (!lastActiveAt) return false
  const t = typeof lastActiveAt === 'string' ? Date.parse(lastActiveAt) : lastActiveAt.getTime()
  return Number.isFinite(t) && now - t < ONLINE_WINDOW_MS
}
