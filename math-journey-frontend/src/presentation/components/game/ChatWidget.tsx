'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageCircle, X, ArrowLeft, Send, Loader2 } from 'lucide-react'
import { Avatar } from '@/presentation/components/avatar/Avatar'
import type { AvatarConfig } from '@/presentation/components/avatar/AvatarConfig'
import {
  getChatThreadsAction,
  getConversationAction,
  sendMessageAction,
  type ChatThread,
  type ChatMessage,
} from '@/app/actions/chat'

/** Avatar do amigo dentro de um círculo (mostra cabeça/ombros) + status online. */
function FriendAvatar({ config, accessories, online, size }: {
  config: AvatarConfig
  accessories: string[]
  online?: boolean
  size: number
}) {
  return (
    <span className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <span className="flex items-start justify-center w-full h-full rounded-full overflow-hidden bg-matema-primary/10">
        <Avatar config={config} ownedItemNames={accessories} size={size} />
      </span>
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
      )}
    </span>
  )
}

function timeLabel(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const sameDay = d.toDateString() === today.toDateString()
  return sameDay
    ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [unreadTotal, setUnreadTotal] = useState(0)
  const [active, setActive] = useState<ChatThread | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const loadThreads = useCallback(async () => {
    const res = await getChatThreadsAction()
    setThreads(res.threads)
    setUnreadTotal(res.unreadTotal)
  }, [])

  const loadConversation = useCallback(async (friendId: string) => {
    const res = await getConversationAction(friendId)
    setMessages(res.messages)
  }, [])

  // Poll da lista: aberto a cada 15s, fechado a cada 60s (leve).
  useEffect(() => {
    void loadThreads() // eslint-disable-line react-hooks/set-state-in-effect -- setState ocorre após await (assíncrono)
    const id = setInterval(loadThreads, open ? 15_000 : 60_000)
    return () => clearInterval(id)
  }, [open, loadThreads])

  // Poll da conversa aberta a cada 5s.
  useEffect(() => {
    if (!open || !active) return
    void loadConversation(active.id) // eslint-disable-line react-hooks/set-state-in-effect -- setState ocorre após await (assíncrono)
    const id = setInterval(() => loadConversation(active.id), 5_000)
    return () => clearInterval(id)
  }, [open, active, loadConversation])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages, active])

  function openThread(t: ChatThread) {
    setErr(null)
    setActive(t)
    setThreads((prev) => prev.map((x) => (x.id === t.id ? { ...x, unread: 0 } : x)))
  }

  async function handleSend() {
    const text = draft.trim()
    if (!text || !active || sending) return
    setErr(null)
    setSending(true)
    const optimistic: ChatMessage = {
      id: `tmp-${Date.now()}`, content: text, fromMe: true,
      createdAt: new Date().toISOString(), read: false,
    }
    setMessages((m) => [...m, optimistic])
    setDraft('')
    const res = await sendMessageAction(active.id, text)
    setSending(false)
    if (res.error) {
      setMessages((m) => m.filter((x) => x.id !== optimistic.id))
      setErr(res.error)
      return
    }
    loadConversation(active.id)
    loadThreads()
  }

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[60]">
      {/* Painel */}
      {open && (
        <div className="mb-3 w-[88vw] max-w-sm h-[28rem] bg-white rounded-3xl border border-matema-border shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Cabeçalho */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-matema-border bg-matema-warm">
            {active ? (
              <>
                <button onClick={() => setActive(null)} className="p-1 -ml-1 rounded-lg text-matema-muted hover:text-matema-dark hover:bg-black/5">
                  <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                </button>
                <FriendAvatar config={active.avatar} accessories={active.accessories} online={active.online} size={28} />
                <div className="min-w-0">
                  <p className="font-bold text-matema-dark text-sm truncate leading-none">{active.displayName}</p>
                  <p className="text-[11px] text-matema-muted leading-none mt-0.5">{active.online ? 'Online' : 'Offline'}</p>
                </div>
              </>
            ) : (
              <p className="font-extrabold text-matema-dark text-sm flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-matema-primary" strokeWidth={2} /> Conversas
              </p>
            )}
            <button onClick={() => setOpen(false)} className="ml-auto p-1 rounded-lg text-matema-muted hover:text-matema-dark hover:bg-black/5">
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          {/* Conteúdo */}
          {active ? (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-matema-cream/40">
                {messages.length === 0 ? (
                  <p className="text-center text-xs text-matema-muted mt-6">Diga olá! 👋</p>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className={`flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-3 py-1.5 text-sm ${m.fromMe ? 'bg-matema-primary text-white rounded-br-sm' : 'bg-white border border-matema-border text-matema-dark rounded-bl-sm'}`}>
                        <p className="break-words whitespace-pre-wrap">{m.content}</p>
                        <p className={`text-[10px] mt-0.5 ${m.fromMe ? 'text-white/70' : 'text-matema-muted'}`}>{timeLabel(m.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {err && <p className="px-3 py-1 text-[11px] text-red-500">{err}</p>}
              <div className="flex items-center gap-2 p-2 border-t border-matema-border">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  maxLength={1000}
                  placeholder="Mensagem…"
                  className="flex-1 rounded-xl border border-matema-border px-3 py-2 text-sm text-matema-dark focus:border-matema-primary outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || draft.trim().length === 0}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-matema-primary text-white disabled:opacity-50 hover:opacity-90"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" strokeWidth={2} />}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {threads.length === 0 ? (
                <p className="text-center text-sm text-matema-muted px-6 mt-10">
                  Adicione amigos para conversar. 💬
                </p>
              ) : (
                threads.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => openThread(t)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-matema-warm transition-colors text-left border-b border-matema-border/60"
                  >
                    <FriendAvatar config={t.avatar} accessories={t.accessories} online={t.online} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-matema-dark text-sm truncate">{t.displayName}</p>
                        {t.lastAt && <span className="text-[10px] text-matema-muted flex-shrink-0">{timeLabel(t.lastAt)}</span>}
                      </div>
                      <p className="text-xs text-matema-muted truncate">
                        {t.lastPreview ? `${t.lastFromMe ? 'Você: ' : ''}${t.lastPreview}` : (t.online ? 'Online' : 'Offline')}
                      </p>
                    </div>
                    {t.unread > 0 && (
                      <span className="flex-shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-matema-primary text-white text-[11px] font-bold flex items-center justify-center">
                        {t.unread}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Bolha */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-14 h-14 rounded-full bg-matema-primary text-white shadow-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition-all ml-auto"
        aria-label="Abrir chat"
      >
        {open ? <X className="w-6 h-6" strokeWidth={2} /> : <MessageCircle className="w-6 h-6" strokeWidth={2} />}
        {!open && unreadTotal > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center border-2 border-white">
            {unreadTotal > 99 ? '99+' : unreadTotal}
          </span>
        )}
      </button>
    </div>
  )
}
