'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Crown, Check, Loader2, QrCode, CreditCard, Gift } from 'lucide-react'
import { startProTrialAction, startProCheckoutAction } from '@/app/actions/pro'

interface Props {
  hasPro: boolean
  isAdmin: boolean
  subscriptionStatus: 'none' | 'trial' | 'active' | 'cancelled'
  proUntil: string | null
  trialUsed: boolean
}

const PRO_PERKS = [
  'Simulado ENEM completo (45 questões, 2h45)',
  'Nota estimada e análise de tempo por questão',
  'Sessão salva — pause e continue depois',
]

export function ProClient({ hasPro, isAdmin, subscriptionStatus, proUntil, trialUsed }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [busy, setBusy] = useState<null | 'trial' | 'pix' | 'subscription'>(null)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="animate-fade-in">
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
            onClick={() => handleCheckout('pix')}
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

      <p className="mt-5 text-xs text-matema-muted leading-relaxed">
        Pagamentos processados pelo AbacatePay. A assinatura no cartão renova automaticamente
        e pode ser cancelada quando quiser. O acesso é liberado assim que o pagamento é confirmado.
      </p>
    </div>
  )
}
