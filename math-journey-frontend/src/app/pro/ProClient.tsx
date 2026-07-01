'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Crown, Check, Loader2, QrCode, CreditCard, Gift, Users, Ticket, Eye, EyeOff, Copy, X } from 'lucide-react'
import { startProTrialAction, startProCheckoutAction, startProPixAction, getProStatusAction } from '@/app/actions/pro'
import { redeemTurmaCodeAction } from '@/app/actions/turma'
import { formatBRL } from '@/domain/pro/turmaPricing'

interface Props {
  hasPro: boolean
  isAdmin: boolean
  subscriptionStatus: 'none' | 'trial' | 'active' | 'cancelled'
  proUntil: string | null
  trialUsed: boolean
  previewFree?: boolean
}

const PRO_PERKS = [
  'Modo "Simulado ENEM": simulados completos de 45 questões com cronômetro de 2h45',
  'Nota estimada com base no sistema TRI e análise de tempo por questão',
  'Modo Duelo: desafie amigos para batalhas de questões e mostre que você detém conhecimento!',
  'Classificação por rating, assim como no Xadrez',
]

export function ProClient({ hasPro, isAdmin, subscriptionStatus, proUntil, trialUsed, previewFree = false }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [busy, setBusy] = useState<null | 'trial' | 'pix' | 'subscription'>(null)
  const [error, setError] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [redeemBusy, setRedeemBusy] = useState(false)
  const [redeemMsg, setRedeemMsg] = useState<string | null>(null)
  const [redeemErr, setRedeemErr] = useState<string | null>(null)
  const [pix, setPix] = useState<{ brCode: string; brCodeBase64: string; amountCents: number } | null>(null)
  const [copied, setCopied] = useState(false)

  // Enquanto o PIX está aberto, verifica se o pagamento foi confirmado (webhook).
  useEffect(() => {
    if (!pix) return
    const id = setInterval(async () => {
      const res = await getProStatusAction()
      if (res.active) { setPix(null); router.refresh() }
    }, 4000)
    return () => clearInterval(id)
  }, [pix, router])

  const proUntilLabel = proUntil
    ? new Date(proUntil).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null

  function handleTrial() {
    setError(null)
    setBusy('trial')
    startTransition(async () => {
      const res = await startProTrialAction()
      setBusy(null)
      if (res.error) { setError(res.error); return }
      router.refresh()
    })
  }

  async function handleCheckout(plan: 'pix' | 'subscription') {
    setError(null)
    setBusy(plan)
    const res = await startProCheckoutAction(plan)
    if (res.error) { setBusy(null); setError(res.error); return }
    if (res.url) window.location.href = res.url
  }

  async function handlePix() {
    setError(null)
    setBusy('pix')
    const res = await startProPixAction()
    setBusy(null)
    if (res.error) { setError(res.error); return }
    if (res.pix) setPix(res.pix)
  }

  function copyBrCode() {
    if (!pix) return
    navigator.clipboard.writeText(pix.brCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function handleRedeem() {
    setRedeemErr(null); setRedeemMsg(null)
    setRedeemBusy(true)
    const res = await redeemTurmaCodeAction(code)
    setRedeemBusy(false)
    if (res.error) { setRedeemErr(res.error); return }
    setRedeemMsg('Código resgatado! Acesso Pro liberado.')
    setCode('')
    router.refresh()
  }

  return (
    <div className="animate-fade-in">
      {/* Modal PIX (30 dias) */}
      {pix && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center px-4" onClick={() => setPix(null)}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl text-center animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPix(null)} className="ml-auto block -mt-2 -mr-2 p-1 rounded-lg text-matema-muted hover:text-matema-dark hover:bg-black/5">
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
            <p className="font-extrabold text-matema-dark flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5 text-matema-primary" strokeWidth={1.75} /> Pague {formatBRL(pix.amountCents)} via PIX
            </p>
            <p className="text-xs text-matema-muted mt-1">30 dias de acesso Pro</p>
            {pix.brCodeBase64 && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pix.brCodeBase64.startsWith('data:') ? pix.brCodeBase64 : `data:image/png;base64,${pix.brCodeBase64}`}
                alt="QR Code PIX"
                className="mx-auto mt-4 w-52 h-52 rounded-xl border border-matema-border"
              />
            )}
            <button
              onClick={copyBrCode}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-matema-border px-4 py-2 text-sm font-bold text-matema-dark hover:border-matema-primary"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              Copiar código copia-e-cola
            </button>
            <p className="mt-4 flex items-center justify-center gap-2 text-sm text-matema-muted">
              <Loader2 className="w-4 h-4 animate-spin" /> Aguardando confirmação do pagamento…
            </p>
          </div>
        </div>
      )}

      {previewFree && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
            <Eye className="w-4 h-4" strokeWidth={2} />
            Pré-visualização: visão de quem não tem assinatura.
          </p>
          <Link
            href="/pro"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex-shrink-0"
          >
            <EyeOff className="w-3.5 h-3.5" strokeWidth={2} /> Sair
          </Link>
        </div>
      )}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
          <Crown className="w-6 h-6 text-amber-500" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-matema-dark leading-tight">Matema Pro</h1>
          <p className="text-sm text-matema-muted">Desbloqueie o Simulado ENEM completo.</p>
        </div>
      </div>

      {/* Status atual */}
      {isAdmin ? (
        <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" strokeWidth={2} /> Você é admin — acesso Pro liberado sem mensalidade.
        </div>
      ) : hasPro ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-bold flex items-center gap-2"><Crown className="w-4 h-4" strokeWidth={2} /> Pro ativo</p>
          {proUntilLabel && (
            <p className="mt-1">
              {subscriptionStatus === 'cancelled'
                ? `Sua assinatura foi cancelada, mas o acesso vale até ${proUntilLabel}.`
                : subscriptionStatus === 'trial'
                  ? `Teste grátis ativo até ${proUntilLabel}.`
                  : `Acesso válido até ${proUntilLabel}.`}
            </p>
          )}
          <Link href="/ranqueada/jogar/simulado" className="inline-block mt-3 font-bold text-amber-700 hover:underline">
            Ir para o Simulado →
          </Link>
        </div>
      ) : null}

      {/* Benefícios */}
      <div className="mt-5 rounded-3xl border border-matema-border bg-white p-5">
        <p className="font-extrabold text-matema-dark text-sm mb-3">O que vem no Pro</p>
        <ul className="space-y-2">
          {PRO_PERKS.map((perk) => (
            <li key={perk} className="flex items-start gap-2 text-sm text-matema-dark">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" strokeWidth={2.25} />
              <span>{perk}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Ações de compra — escondidas para quem já tem acesso */}
      {!isAdmin && !hasPro && (
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {!trialUsed && (
            <button
              onClick={handleTrial}
              disabled={pending || busy !== null}
              className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-matema-border bg-white p-4 font-bold text-matema-dark hover:border-matema-primary disabled:opacity-60 transition-colors"
            >
              {busy === 'trial' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Gift className="w-5 h-5 text-matema-primary" strokeWidth={1.75} />}
              <span className="text-sm">Testar 7 dias grátis</span>
              <span className="text-xs text-matema-muted font-normal">Sem cobrança</span>
            </button>
          )}

          <button
            onClick={handlePix}
            disabled={busy !== null}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-matema-border bg-white p-4 font-bold text-matema-dark hover:border-matema-primary disabled:opacity-60 transition-colors"
          >
            {busy === 'pix' ? <Loader2 className="w-5 h-5 animate-spin" /> : <QrCode className="w-5 h-5 text-matema-primary" strokeWidth={1.75} />}
            <span className="text-sm">Pagar com PIX</span>
            <span className="text-xs text-matema-muted font-normal">30 dias de acesso</span>
          </button>

          <button
            onClick={() => handleCheckout('subscription')}
            disabled={busy !== null}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-amber-500 p-4 font-bold text-white hover:bg-amber-600 disabled:opacity-60 transition-colors"
          >
            {busy === 'subscription' ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" strokeWidth={1.75} />}
            <span className="text-sm">Assinar mensal</span>
            <span className="text-xs text-white/80 font-normal">Cartão · renova sozinho</span>
          </button>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {/* Plano Turma (responsável compra N vagas com desconto) */}
      {!isAdmin && (
        <Link
          href="/pro/turma"
          className="mt-5 flex items-center gap-3 rounded-2xl p-4 hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #1e1b2e 0%, #2a2050 100%)', border: '1px solid rgba(109,85,204,0.4)' }}
        >
          <Users className="w-6 h-6 text-indigo-300 flex-shrink-0" strokeWidth={1.75} />
          <div className="flex-1">
            <p className="font-extrabold text-white text-sm">É professor ou coordenador?</p>
            <p className="text-xs" style={{ color: 'rgba(196,181,253,0.8)' }}>Plano Turma: Pro para a sala toda, com até 25% de desconto por aluno.</p>
          </div>
          <span className="font-bold text-indigo-300">→</span>
        </Link>
      )}

      {/* Resgate de código de turma */}
      <div className="mt-4 rounded-2xl border border-matema-border bg-white p-4">
        <p className="font-bold text-matema-dark text-sm flex items-center gap-2">
          <Ticket className="w-4 h-4 text-matema-primary" strokeWidth={1.75} /> Tem um código de turma?
        </p>
        <div className="mt-2 flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="TRM-XXXXXXXX"
            className="flex-1 rounded-xl border-2 border-matema-border px-3 py-2 font-mono text-sm font-bold text-matema-dark uppercase focus:border-matema-primary outline-none"
          />
          <button
            onClick={handleRedeem}
            disabled={redeemBusy || code.trim().length < 4}
            className="rounded-xl bg-matema-primary px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
          >
            {redeemBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Resgatar'}
          </button>
        </div>
        {redeemMsg && <p className="mt-2 text-sm text-green-600 font-semibold">{redeemMsg}</p>}
        {redeemErr && <p className="mt-2 text-sm text-red-500">{redeemErr}</p>}
      </div>

      <p className="mt-5 text-xs text-matema-muted leading-relaxed">
        Pagamentos processados pelo AbacatePay. A assinatura no cartão renova automaticamente
        e pode ser cancelada quando quiser. O acesso é liberado assim que o pagamento é confirmado.
      </p>
    </div>
  )
}
