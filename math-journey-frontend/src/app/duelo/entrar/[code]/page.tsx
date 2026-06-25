'use client'

import { useState, useTransition } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { NinjaIcon } from '@/presentation/components/game/NinjaIcon'
import { joinDuelByCodeAction } from '@/app/actions/duelo'
import { Loader2 } from 'lucide-react'

export default function DueloEntrarPage() {
  const params  = useParams<{ code: string }>()
  const router  = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const code = (params.code ?? '').toUpperCase()

  function handleJoin() {
    setError('')
    startTransition(async () => {
      const res = await joinDuelByCodeAction(code)
      if (res.error) { setError(res.error); return }
      router.push(`/duelo/${res.duelId}`)
    })
  }

  return (
    <div className="max-w-sm mx-auto py-16 text-center animate-fade-in">
      <NinjaIcon className="w-14 h-14 text-matema-accent mx-auto mb-5" strokeWidth={1.5} />
      <h1 className="text-xl font-extrabold text-matema-dark mb-2">Você foi desafiado!</h1>
      <p className="text-sm text-matema-muted mb-6">
        Código do duelo: <span className="font-mono font-extrabold text-matema-dark tracking-widest">{code}</span>
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <button
        onClick={handleJoin}
        disabled={pending}
        className="w-full bg-matema-accent text-white font-bold py-4 rounded-3xl hover:opacity-90 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 mb-3"
      >
        {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <NinjaIcon className="w-5 h-5" />}
        Aceitar Duelo
      </button>

      <Link href="/duelo" className="text-sm text-matema-muted hover:text-matema-dark transition-colors">
        Recusar
      </Link>
    </div>
  )
}
