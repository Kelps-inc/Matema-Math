'use client'

import { useActionState } from 'react'
import { signIn } from '@/app/actions/auth'
import { Button } from '@/presentation/components/ui/Button'

export function SignInForm() {
  const [state, action, pending] = useActionState(signIn, null)

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-matema-dark mb-1.5">E-mail</label>
        <input
          name="email"
          type="email"
          required
          placeholder="seu@email.com"
          className="w-full h-11 px-4 rounded-2xl border-2 border-matema-border bg-matema-cream text-matema-dark placeholder:text-matema-muted focus:outline-none focus:border-matema-primary transition-colors text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-matema-dark mb-1.5">Senha</label>
        <input
          name="password"
          type="password"
          required
          placeholder="••••••••"
          className="w-full h-11 px-4 rounded-2xl border-2 border-matema-border bg-matema-cream text-matema-dark placeholder:text-matema-muted focus:outline-none focus:border-matema-primary transition-colors text-sm"
        />
      </div>

      {state?.error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <Button type="submit" loading={pending} className="w-full" size="lg">
        Entrar
      </Button>
    </form>
  )
}
