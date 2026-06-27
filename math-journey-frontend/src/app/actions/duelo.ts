'use server'

import { createClient } from '@/infrastructure/supabase/server'
import { revalidatePath } from 'next/cache'

export interface DuelAnswer {
  exerciseId: string
  answer: string
  isCorrect: boolean
  timeMs: number
}

export interface DuelExercise {
  id: string
  question: string
  context: string | null
  type: string
  options: string[] | null
  correct_answer: string
  explanation: string | null
  difficulty: string
  source: string | null
}

export interface DuelSummary {
  id: string
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  inviteCode: string | null
  challengerId: string
  challengerName: string
  opponentId: string | null
  opponentName: string | null
  challengerCorrect: number | null
  opponentCorrect: number | null
  challengerPlayedAt: string | null
  opponentPlayedAt: string | null
  winnerId: string | null
  challengerRatingChange: number | null
  opponentRatingChange: number | null
  createdAt: string
  expiresAt: string
}

function calcEloChange(myRating: number, opponentRating: number, result: 1 | 0 | 0.5): number {
  const K = 32
  const expected = 1 / (1 + Math.pow(10, (opponentRating - myRating) / 400))
  return Math.round(K * (result - expected))
}

function makeInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function pickDuelQuestionIds(supabaseAny: any): Promise<string[]> {
  const slugs = ['ranqueada-facil', 'ranqueada-medio', 'ranqueada-dificil', 'ranqueada-enem']
  const { data: lessons } = await supabaseAny.from('lessons').select('id').in('slug', slugs)
  if (!lessons || lessons.length === 0) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lessonIds = lessons.map((l: any) => l.id)
  const { data: exercises } = await supabaseAny.from('exercises').select('id').in('lesson_id', lessonIds)
  if (!exercises || exercises.length === 0) return []
  return [...exercises].sort(() => Math.random() - 0.5).slice(0, 7).map((e: any) => e.id) // eslint-disable-line @typescript-eslint/no-explicit-any
}

export async function createDuelAction(opts: {
  type: 'random' | 'invite' | 'challenge'
  opponentId?: string
}): Promise<{ duelId?: string; inviteCode?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  if (opts.type === 'random') {
    const { data: openDuels } = await db
      .from('duels')
      .select('id')
      .eq('status', 'pending')
      .is('opponent_id', null)
      .neq('challenger_id', user.id)
      .gt('expires_at', new Date().toISOString())
      .limit(5)

    if (openDuels && openDuels.length > 0) {
      const target = openDuels[Math.floor(Math.random() * openDuels.length)]
      const { error } = await db
        .from('duels')
        .update({ opponent_id: user.id, status: 'active' })
        .eq('id', target.id)
        .is('opponent_id', null)
      if (!error) {
        revalidatePath('/duelo')
        return { duelId: target.id }
      }
    }
  }

  const questionIds = await pickDuelQuestionIds(db)
  if (questionIds.length < 7) return { error: 'Questões insuficientes para criar duelo.' }

  const inviteCode = opts.type === 'invite' ? makeInviteCode() : undefined
  const opponentId = opts.type === 'challenge' ? opts.opponentId : undefined
  const status = opponentId ? 'active' : 'pending'

  const { data: newDuel, error } = await db
    .from('duels')
    .insert({
      challenger_id: user.id,
      opponent_id: opponentId ?? null,
      status,
      invite_code: inviteCode ?? null,
      question_ids: questionIds,
    })
    .select('id, invite_code')
    .single()

  if (error || !newDuel) return { error: 'Erro ao criar duelo.' }

  revalidatePath('/duelo')
  return { duelId: newDuel.id, inviteCode: newDuel.invite_code ?? undefined }
}

export async function joinDuelByCodeAction(
  code: string,
): Promise<{ duelId?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: duel } = await db
    .from('duels')
    .select('id, challenger_id, opponent_id, status, expires_at')
    .eq('invite_code', code.toUpperCase().trim())
    .single()

  if (!duel) return { error: 'Código inválido ou duelo não encontrado.' }
  if (duel.challenger_id === user.id) return { error: 'Você não pode entrar no seu próprio duelo.' }
  if (duel.opponent_id && duel.opponent_id !== user.id) return { error: 'Este duelo já tem um oponente.' }
  if (duel.status !== 'pending') return { error: 'Este duelo não está mais disponível.' }
  if (new Date(duel.expires_at) < new Date()) return { error: 'Este duelo expirou.' }

  const { error } = await db
    .from('duels')
    .update({ opponent_id: user.id, status: 'active' })
    .eq('id', duel.id)

  if (error) return { error: 'Erro ao entrar no duelo.' }

  revalidatePath('/duelo')
  return { duelId: duel.id }
}

export async function submitDuelAnswersAction(
  duelId: string,
  answers: DuelAnswer[],
): Promise<{ error?: string; completed?: boolean; winnerId?: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: duel } = await db.from('duels').select('*').eq('id', duelId).single()
  if (!duel) return { error: 'Duelo não encontrado.' }
  if (duel.status === 'completed' || duel.status === 'cancelled') return { error: 'Duelo já encerrado.' }

  const isChallenger = duel.challenger_id === user.id
  const isOpponent   = duel.opponent_id   === user.id
  if (!isChallenger && !isOpponent) return { error: 'Você não faz parte deste duelo.' }
  if (isChallenger && duel.challenger_played_at) return { error: 'Você já enviou suas respostas.' }
  if (isOpponent   && duel.opponent_played_at)   return { error: 'Você já enviou suas respostas.' }

  const correct     = answers.filter((a) => a.isCorrect).length
  const totalTimeMs = answers.reduce((s, a) => s + a.timeMs, 0)
  const answersJson = Object.fromEntries(answers.map((a) => [a.exerciseId, a.answer]))
  const now         = new Date().toISOString()

  const myField = isChallenger
    ? { challenger_answers: answersJson, challenger_correct: correct, challenger_time_ms: totalTimeMs, challenger_played_at: now }
    : { opponent_answers: answersJson,   opponent_correct:   correct, opponent_time_ms:   totalTimeMs, opponent_played_at:   now }

  const otherPlayed = isChallenger ? !!duel.opponent_played_at : !!duel.challenger_played_at

  if (otherPlayed) {
    const cCorrect  = isChallenger ? correct              : (duel.challenger_correct ?? 0)
    const cTimeMs   = isChallenger ? totalTimeMs          : (duel.challenger_time_ms ?? 0)
    const oCorrect  = isOpponent   ? correct              : (duel.opponent_correct   ?? 0)
    const oTimeMs   = isOpponent   ? totalTimeMs          : (duel.opponent_time_ms   ?? 0)

    let winnerId: string | null = null
    let cResult: 1 | 0 | 0.5 = 0.5
    let oResult: 1 | 0 | 0.5 = 0.5

    if (cCorrect > oCorrect) {
      winnerId = duel.challenger_id; cResult = 1; oResult = 0
    } else if (oCorrect > cCorrect) {
      winnerId = duel.opponent_id;   cResult = 0; oResult = 1
    } else if (cTimeMs < oTimeMs) {
      winnerId = duel.challenger_id; cResult = 1; oResult = 0
    } else if (oTimeMs < cTimeMs) {
      winnerId = duel.opponent_id;   cResult = 0; oResult = 1
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profiles } = await db.from('user_profiles').select('id, duel_rating, duel_wins, duel_losses').in('id', [duel.challenger_id, duel.opponent_id])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cProfile = (profiles ?? []).find((p: any) => p.id === duel.challenger_id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const oProfile = (profiles ?? []).find((p: any) => p.id === duel.opponent_id)
    const cRating  = cProfile?.duel_rating ?? 1000
    const oRating  = oProfile?.duel_rating ?? 1000
    const cChange  = calcEloChange(cRating, oRating, cResult)
    const oChange  = calcEloChange(oRating, cRating, oResult)

    await db.from('duels').update({
      ...myField,
      status: 'completed',
      winner_id: winnerId,
      challenger_rating_change: cChange,
      opponent_rating_change: oChange,
      completed_at: now,
    }).eq('id', duelId)

    // SECURITY DEFINER RPC — bypasses RLS para atualizar perfis de ambos os jogadores
    await db.rpc('apply_duel_ratings', {
      p_duel_id: duelId,
      p_c_delta: cChange,
      p_o_delta: oChange,
      p_c_won:   cResult === 1,
      p_o_won:   oResult === 1,
    })

    revalidatePath('/duelo')
    revalidatePath(`/duelo/${duelId}`)
    return { completed: true, winnerId }
  }

  await db.from('duels').update(myField).eq('id', duelId)
  revalidatePath(`/duelo/${duelId}`)
  return { completed: false }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDuel(d: any, nameMap: Record<string, string>): DuelSummary {
  return {
    id: d.id,
    status: d.status,
    inviteCode: d.invite_code,
    challengerId: d.challenger_id,
    challengerName: nameMap[d.challenger_id] ?? 'Jogador',
    opponentId: d.opponent_id,
    opponentName: d.opponent_id ? (nameMap[d.opponent_id] ?? 'Jogador') : null,
    challengerCorrect: d.challenger_correct,
    opponentCorrect: d.opponent_correct,
    challengerPlayedAt: d.challenger_played_at,
    opponentPlayedAt: d.opponent_played_at,
    winnerId: d.winner_id,
    challengerRatingChange: d.challenger_rating_change,
    opponentRatingChange: d.opponent_rating_change,
    createdAt: d.created_at,
    expiresAt: d.expires_at,
  }
}

export async function getMyDuelsAction(): Promise<{ duels: DuelSummary[]; myId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { duels: [], myId: '' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: rows } = await db
    .from('duels')
    .select('id, status, invite_code, challenger_id, opponent_id, challenger_correct, opponent_correct, challenger_played_at, opponent_played_at, winner_id, challenger_rating_change, opponent_rating_change, created_at, expires_at')
    .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false })
    .limit(30)

  if (!rows || rows.length === 0) return { duels: [], myId: user.id }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ids = Array.from(new Set<string>([...rows.map((d: any) => d.challenger_id), ...rows.map((d: any) => d.opponent_id).filter(Boolean)]))
  const { data: profiles } = await db.from('user_profiles').select('id, display_name').in('id', ids)
  const nameMap: Record<string, string> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const p of profiles ?? []) nameMap[p.id] = p.display_name ?? 'Jogador'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { duels: rows.map((d: any) => mapDuel(d, nameMap)), myId: user.id }
}

export async function getDuelAction(duelId: string): Promise<{
  duel?: DuelSummary & { questionIds: string[] }
  exercises?: DuelExercise[]
  myRole?: 'challenger' | 'opponent'
  myAnswers?: Record<string, string>
  myDuelRating?: number
  opponentDuelRating?: number
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: d } = await db.from('duels').select('*').eq('id', duelId).single()
  if (!d) return { error: 'Duelo não encontrado.' }

  const isChallenger = d.challenger_id === user.id
  const isOpponent   = d.opponent_id   === user.id
  if (!isChallenger && !isOpponent) return { error: 'Você não tem acesso a este duelo.' }

  const participantIds = [d.challenger_id, d.opponent_id].filter(Boolean) as string[]
  const { data: profiles } = await db.from('user_profiles').select('id, display_name, duel_rating').in('id', participantIds)
  const nameMap: Record<string, string> = {}
  const ratingMap: Record<string, number> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const p of profiles ?? []) { nameMap[p.id] = p.display_name ?? 'Jogador'; ratingMap[p.id] = p.duel_rating ?? 1000 }

  const { data: exRows } = await db
    .from('exercises')
    .select('id, question, context, type, options, correct_answer, explanation, difficulty, source')
    .in('id', d.question_ids)

  const myRole    = isChallenger ? 'challenger' : 'opponent'
  const myAnswers = isChallenger ? (d.challenger_answers ?? {}) : (d.opponent_answers ?? {})

  return {
    duel: {
      ...mapDuel(d, nameMap),
      questionIds: d.question_ids ?? [],
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exercises: (exRows ?? []).map((e: any) => ({ ...e, options: Array.isArray(e.options) ? e.options : null })),
    myRole,
    myAnswers,
    myDuelRating:       ratingMap[user.id]         ?? 1000,
    opponentDuelRating: ratingMap[isChallenger ? d.opponent_id : d.challenger_id] ?? 1000,
  }
}

// ── Friendships ─────────────────────────────────────────────────────────────

export async function searchUsersAction(query: string): Promise<{
  id: string
  displayName: string
  username: string
  level: number
  duelRating: number
  friendStatus: 'none' | 'pending_sent' | 'pending_received' | 'friends'
}[]> {
  if (!query.trim() || query.length < 2) return []

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: users } = await db
    .from('user_profiles')
    .select('id, display_name, username, level, duel_rating')
    .neq('id', user.id)
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(10)

  if (!users || users.length === 0) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userIds = users.map((u: any) => u.id)

  const { data: friendships } = await db
    .from('friendships')
    .select('requester_id, addressee_id, status')
    .or(
      `and(requester_id.eq.${user.id},addressee_id.in.(${userIds.join(',')})),` +
      `and(addressee_id.eq.${user.id},requester_id.in.(${userIds.join(',')}))`
    )

  const friendMap: Record<string, 'none' | 'pending_sent' | 'pending_received' | 'friends'> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const f of friendships ?? []) {
    const otherId = f.requester_id === user.id ? f.addressee_id : f.requester_id
    if (f.status === 'accepted') friendMap[otherId] = 'friends'
    else if (f.status === 'pending') friendMap[otherId] = f.requester_id === user.id ? 'pending_sent' : 'pending_received'
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return users.map((u: any) => ({
    id: u.id,
    displayName: u.display_name ?? 'Jogador',
    username: u.username ?? '',
    level: u.level ?? 1,
    duelRating: u.duel_rating ?? 1000,
    friendStatus: friendMap[u.id] ?? 'none',
  }))
}

export async function sendFriendRequestAction(userId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }
  if (user.id === userId) return { error: 'Você não pode adicionar a si mesmo.' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('friendships').insert({ requester_id: user.id, addressee_id: userId })
  if (error) {
    if (error.code === '23505') return { error: 'Pedido já enviado.' }
    return { error: 'Erro ao enviar pedido.' }
  }
  revalidatePath('/usuarios')
  return {}
}

export async function acceptFriendRequestAction(requesterId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('friendships')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('requester_id', requesterId)
    .eq('addressee_id', user.id)
    .eq('status', 'pending')

  if (error) return { error: 'Erro ao aceitar pedido.' }
  revalidatePath('/amigos', 'page')
  return {}
}

export async function getMyFriendsAction(): Promise<{
  friends: { id: string; displayName: string; username: string; level: number; duelRating: number }[]
  pendingReceived: { id: string; displayName: string; username: string }[]
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { friends: [], pendingReceived: [] }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: friendships } = await db
    .from('friendships')
    .select('requester_id, addressee_id, status')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .in('status', ['accepted', 'pending'])

  if (!friendships || friendships.length === 0) return { friends: [], pendingReceived: [] }

  const friendIds: string[] = []
  const pendingReceivedIds: string[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const f of friendships) {
    if (f.status === 'accepted') {
      friendIds.push(f.requester_id === user.id ? f.addressee_id : f.requester_id)
    } else if (f.status === 'pending' && f.addressee_id === user.id) {
      pendingReceivedIds.push(f.requester_id)
    }
  }

  const allIds = [...friendIds, ...pendingReceivedIds]
  if (allIds.length === 0) return { friends: [], pendingReceived: [] }

  const { data: profiles } = await db.from('user_profiles').select('id, display_name, username, level, duel_rating').in('id', allIds)
  const profileMap: Record<string, any> = {} // eslint-disable-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const p of profiles ?? []) profileMap[p.id] = p

  const friends = friendIds.map((id) => profileMap[id]).filter(Boolean).map((p: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
    id: p.id, displayName: p.display_name ?? 'Jogador', username: p.username ?? '', level: p.level ?? 1, duelRating: p.duel_rating ?? 1000,
  }))
  const pendingReceived = pendingReceivedIds.map((id) => profileMap[id]).filter(Boolean).map((p: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
    id: p.id, displayName: p.display_name ?? 'Jogador', username: p.username ?? '',
  }))

  return { friends, pendingReceived }
}
