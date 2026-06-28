'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { Users, Loader2, QrCode, Copy, Check, ArrowLeft, Ticket } from 'lucide-react'
import {
  createTurmaOrderAction,
  getTurmaOrderStatusAction,
  type TurmaCheckout,
} from '@/app/actions/turma'
import {
  quoteTurma,
  formatBRL,
  TURMA_MIN_SEATS,
  TURMA_MAX_SEATS,
  TURMA_MONTH_OPTIONS,
  TURMA_BULK_THRESHOLD,
} from '@/domain/pro/turmaPricing'

export function TurmaClient() {
  const [seats, setSeats] = useState(10)
  const [months, setMonths] = useState<number>(1)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkout, setCheckout] = useState<TurmaCheckout | null>(null)
  const [paid, setPaid] = useState(false)
  const [codes, setCodes] = useState<string[]>([])
  const [copied, setCopied] = useState<string | null>(null)

  const quote = useMemo(() => {
    try { return quoteTurma(seats, months) } catch { return null }
  }, [seats, months])

  async function handleGenerate() {
    setError(null)
    setBusy(true)
    const res = await createTurmaOrderAction({ seats, months })
    setBusy(false)
    if (res.error) { setError(res.error); return }
    if (res.checkout) setCheckout(res.checkout)
  }

  // Polling: a confirmação chega pelo webhook; consultamos nosso DB.
  const poll = useCallback(async () => {
    if (!checkout) return
    const res = await getTurmaOrderStatusAction(checkout.orderId)
    if (res.order?.status === 'paid') {
      setPaid(true)
      setCodes(res.order.codes)
    }
  }, [checkout])

  useEffect(() => {
    if (!checkout || paid) return
    const t = setInterval(poll, 4000)
    return () => clearInterval(t)
  }, [checkout, paid, poll])

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="animate-fade-in">
      <Link href="/pro" className="inline-flex items-center gap-1.5 text-sm text-matema-muted hover:text-matema-dark mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar ao Pro
      </Link>

      <div className="flex items-center gap-3 mb-1">
        <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center">
          <Users className="w-6 h-6 text-indigo-500" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-matema-dark leading-tight">Plano Turma</h1>
          <p className="text-sm text-matema-muted">Pro para a sala inteira, com desconto por aluno.</p>
        </div>
      </div>

      {/* Resultado: códigos gerados */}
      {paid ? (
        <div className="mt-5 rounded-3xl border border-green-200 bg-green-50 p-5">
          <p className="font-extrabold text-green-800 flex items-center gap-2">
            <Check className="w-5 h-5" strokeWidth={2.25} /> Pagamento confirmado!
          </p>
          <p className="mt-1 text-sm text-green-800">
            {codes.length} códigos gerados. Distribua um para cada aluno — cada código libera o Pro por {months} {months === 1 ? 'mês' : 'meses'}.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {codes.map((code) => (
              <button
                key={code}
                onClick={() => copy(code, code)}
                className="flex items-center justify-between gap-2 rounded-xl border border-green-200 bg-white px-3 py-2 font-mono text-sm font-bold text-matema-dark hover:border-green-400 transition-colors"
              >
                {code}
                {copied === code ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-matema-muted" />}
              </button>
            ))}
          </div>
          <button
            onClick={() => copy(codes.join('\n'), 'all')}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
          >
            {copied === 'all' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            Copiar todos os códigos
          </button>
        </div>
      ) : checkout ? (
        /* PIX gerado — aguardando pagamento */
        <div className="mt-5 rounded-3xl border border-matema-border bg-white p-5 text-center">
          <p className="font-extrabold text-matema-dark flex items-center justify-center gap-2">
            <QrCode className="w-5 h-5 text-matema-primary" strokeWidth={1.75} /> Pague {formatBRL(checkout.amountCents)} via PIX
          </p>
          {checkout.brCodeBase64 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={checkout.brCodeBase64.startsWith('data:') ? checkout.brCodeBase64 : `data:image/png;base64,${checkout.brCodeBase64}`}
              alt="QR Code PIX"
              className="mx-auto mt-4 w-52 h-52 rounded-xl border border-matema-border"
            />
          )}
          <button
            onClick={() => copy(checkout.brCode, 'brcode')}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-matema-border px-4 py-2 text-sm font-bold text-matema-dark hover:border-matema-primary"
          >
            {copied === 'brcode' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            Copiar código copia-e-cola
          </button>
          <p className="mt-4 flex items-center justify-center gap-2 text-sm text-matema-muted">
            <Loader2 className="w-4 h-4 animate-spin" /> Aguardando confirmação do pagamento…
          </p>
        </div>
      ) : (
        /* Configuração da turma */
        <div className="mt-5 rounded-3xl border border-matema-border bg-white p-5">
          <label className="block text-sm font-bold text-matema-dark">Quantidade de alunos</label>
          <input
            type="number"
            min={TURMA_MIN_SEATS}
            max={TURMA_MAX_SEATS}
            value={seats}
            onChange={(e) => setSeats(Math.max(TURMA_MIN_SEATS, Math.min(TURMA_MAX_SEATS, Number(e.target.value) || 0)))}
            className="mt-1.5 w-full rounded-xl border-2 border-matema-border px-3 py-2 font-bold text-matema-dark focus:border-matema-primary outline-none"
          />

          <label className="block mt-4 text-sm font-bold text-matema-dark">Duração</label>
          <div className="mt-1.5 grid grid-cols-4 gap-2">
            {TURMA_MONTH_OPTIONS.map((m) => (
              <button
                key={m}
                onClick={() => setMonths(m)}
                className={`rounded-xl border-2 py-2 text-sm font-bold transition-colors ${
                  months === m ? 'border-matema-primary bg-matema-primary/10 text-matema-primary' : 'border-matema-border text-matema-dark hover:border-matema-primary'
                }`}
              >
                {m} {m === 1 ? 'mês' : 'meses'}
              </button>
            ))}
          </div>

          {quote && (
            <div className="mt-5 rounded-2xl bg-matema-bg/60 p-4 text-sm">
              <div className="flex justify-between text-matema-muted">
                <span>{formatBRL(quote.unitPriceCents)} × {seats} alunos × {months} {months === 1 ? 'mês' : 'meses'}</span>
                <span>{formatBRL(quote.unitPriceCents * seats * months)}</span>
              </div>
              <div className="flex justify-between text-green-600 font-semibold mt-1">
                <span>Desconto turma ({quote.discountPct}% off{seats >= TURMA_BULK_THRESHOLD ? '' : `, a partir de ${TURMA_BULK_THRESHOLD} alunos = 25%`})</span>
                <span>− {formatBRL(quote.unitPriceCents * seats * months - quote.totalCents)}</span>
              </div>
              <div className="flex justify-between text-matema-dark font-extrabold text-base mt-2 pt-2 border-t border-matema-border">
                <span>Total</span>
                <span>{formatBRL(quote.totalCents)}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={busy || !quote}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-500 py-3 font-bold text-white hover:bg-indigo-600 disabled:opacity-60 transition-colors"
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Ticket className="w-5 h-5" strokeWidth={1.75} />}
            Gerar PIX e códigos
          </button>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      <p className="mt-5 text-xs text-matema-muted leading-relaxed">
        Pagamento único via PIX (AbacatePay). Assim que confirmado, geramos um código por aluno —
        cada aluno resgata o seu na página do Pro e ganha acesso por todo o período contratado.
      </p>
    </div>
  )
}
