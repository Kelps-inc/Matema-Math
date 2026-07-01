'use server'

import { createClient } from '@/infrastructure/supabase/server'
import { isOnline } from '@/domain/social/presence'

/* eslint-disable @typescript-eslint/no-explicit-any */

const SEVEN_DAYS_ISO = () => new Date(Date.now() - 7 * 864e5).toISOString()

/** Ids dos amigos (friendship 'accepted') do usuário. */
async function acceptedFriendIds(db: any, userId: string): Promise<string[]> {
  const { data } = await db
    .from('friendships')
    .select('requester_id, addressee_id')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
  if (!data) return []
  return data.map((f: any) => (f.requester_id === userId ? f.addressee_id : f.requester_id))
}

/** Heartbeat de presença: marca o usuário como ativo agora. */
export async function touchPresenceAction(): Promise<{ ok: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false }
  await (supabase as any)
    .from('user_profiles')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', user.id)
  return { ok: true }
}

/** Contagem leve de amigos online (para o "(N)" no header). */
export async function getOnlineFriendCountAction(): Promise<number> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0
  const db = supabase as any
  const ids = await acceptedFriendIds(db, user.id)
  if (ids.length === 0) return 0
  const { data } = await db.from('user_profiles').select('last_active_at').in('id', ids)
  const now = Date.now()
  return (data ?? []).filter((p: any) => isOnline(p.last_active_at, now)).length
}

export interface ChatThread {
  id: string
  displayName: string
  username: string
  online: boolean
  unread: number
  lastAt: string | null
  lastPreview: string | null
  lastFromMe: boolean
}

/**
 * Lista de conversas para o widget: amigos + status online + não-lidas +
 * prévia da última mensagem. Tudo numa tacada, só com as mensagens dos últimos
 * 7 dias (leve).
 */
export async function getChatThreadsAction(): Promise<{
  threads: ChatThread[]
  onlineCount: number
  unreadTotal: number
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { threads: [], onlineCount: 0, unreadTotal: 0 }

  const db = supabase as any
  const friendIds = await acceptedFriendIds(db, user.id)
  if (friendIds.length === 0) return { threads: [], onlineCount: 0, unreadTotal: 0 }

  const { data: profiles } = await db
    .from('user_profiles')
    .select('id, display_name, username, last_active_at')
    .in('id', friendIds)

  // Mensagens recentes envolvendo o usuário (últimos 7 dias).
  const since = SEVEN_DAYS_ISO()
  const { data: msgs } = await db
    .from('chat_messages')
    .select('sender_id, recipient_id, content, read_at, created_at')
    .gt('created_at', since)
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  const now = Date.now()
  const lastByFriend = new Map<string, { content: string; createdAt: string; fromMe: boolean }>()
  const unreadByFriend = new Map<string, number>()

  for (const m of msgs ?? []) {
    const other = m.sender_id === user.id ? m.recipient_id : m.sender_id
    if (!lastByFriend.has(other)) {
      lastByFriend.set(other, { content: m.content, createdAt: m.created_at, fromMe: m.sender_id === user.id })
    }
    if (m.recipient_id === user.id && m.read_at == null) {
      unreadByFriend.set(m.sender_id, (unreadByFriend.get(m.sender_id) ?? 0) + 1)
    }
  }

  const threads: ChatThread[] = (profiles ?? []).map((p: any) => {
    const last = lastByFriend.get(p.id)
    return {
      id: p.id,
      displayName: p.display_name ?? 'Jogador',
      username: p.username ?? '',
      online: isOnline(p.last_active_at, now),
      unread: unreadByFriend.get(p.id) ?? 0,
      lastAt: last?.createdAt ?? null,
      lastPreview: last?.content ?? null,
      lastFromMe: last?.fromMe ?? false,
    }
  })

  // Ordena: conversa mais recente primeiro; depois online; depois nome.
  threads.sort((a, b) => {
    if (a.lastAt && b.lastAt) return a.lastAt < b.lastAt ? 1 : -1
    if (a.lastAt) return -1
    if (b.lastAt) return 1
    if (a.online !== b.online) return a.online ? -1 : 1
    return a.displayName.localeCompare(b.displayName, 'pt-BR')
  })

  const onlineCount = threads.filter((t) => t.online).length
  const unreadTotal = Array.from(unreadByFriend.values()).reduce((s, n) => s + n, 0)
  return { threads, onlineCount, unreadTotal }
}

export interface ChatMessage {
  id: string
  content: string
  fromMe: boolean
  createdAt: string
  read: boolean
}

/** Conversa com um amigo (últimos 7 dias) + marca as recebidas como lidas. */
export async function getConversationAction(friendId: string): Promise<{
  messages: ChatMessage[]
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { messages: [], error: 'Não autenticado' }

  const db = supabase as any
  const since = SEVEN_DAYS_ISO()

  const { data: rows } = await db
    .from('chat_messages')
    .select('id, sender_id, recipient_id, content, read_at, created_at')
    .gt('created_at', since)
    .or(
      `and(sender_id.eq.${user.id},recipient_id.eq.${friendId}),` +
      `and(sender_id.eq.${friendId},recipient_id.eq.${user.id})`,
    )
    .order('created_at', { ascending: true })

  // Marca como lidas as recebidas deste amigo.
  await db
    .from('chat_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', user.id)
    .eq('sender_id', friendId)
    .is('read_at', null)

  const messages: ChatMessage[] = (rows ?? []).map((m: any) => ({
    id: m.id,
    content: m.content,
    fromMe: m.sender_id === user.id,
    createdAt: m.created_at,
    read: m.read_at != null,
  }))
  return { messages }
}

/** Envia uma DM a um amigo. A RLS garante que só amigos podem trocar mensagens. */
export async function sendMessageAction(
  friendId: string,
  content: string,
): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const text = (content ?? '').trim()
  if (text.length === 0) return { error: 'Mensagem vazia' }
  if (text.length > 1000) return { error: 'Mensagem muito longa (máx. 1000)' }

  const { error } = await (supabase as any)
    .from('chat_messages')
    .insert({ sender_id: user.id, recipient_id: friendId, content: text })

  if (error) {
    // 42P01 = tabela inexistente (migration 007 não aplicada).
    if (error.code === '42P01') {
      return { error: 'Chat ainda não configurado no servidor (migration pendente).' }
    }
    // 42501 / violação de RLS = não são amigos (ou amizade não aceita).
    if (error.code === '42501' || /row-level security/i.test(error.message ?? '')) {
      return { error: 'Não foi possível enviar. Vocês precisam ser amigos.' }
    }
    return { error: error.message || 'Não foi possível enviar.' }
  }
  return { ok: true }
}
