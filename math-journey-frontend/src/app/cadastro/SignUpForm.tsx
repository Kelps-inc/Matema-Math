'use client'

import { useActionState } from 'react'
import { signUp } from '@/app/actions/auth'
import { Button } from '@/presentation/components/ui/Button'

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, null)

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-matema-dark mb-1.5">Como você se chama?</label>
        <input
          name="displayName"
          type="text"
          required
          minLength={2}
          placeholder="Seu nome"
          className="w-full h-11 px-4 rounded-2xl border-2 border-matema-border bg-matema-cream text-matema-dark placeholder:text-matema-muted focus:outline-none focus:border-matema-primary transition-colors text-sm"
        />
      </div>

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
          minLength={6}
          placeholder="Mínimo 6 caracteres"
          className="w-full h-11 px-4 rounded-2xl border-2 border-matema-border bg-matema-cream text-matema-dark placeholder:text-matema-muted focus:outline-none focus:border-matema-primary transition-colors text-sm"
        />
      </div>

      {state?.error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <Button type="submit" loading={pending} className="w-full" size="lg">
        Criar conta grátis
      </Button>

      <p className="text-center text-xs text-matema-muted pt-2">
        Ao criar conta, você concorda com os nossos termos de uso.
      </p>
    </form>
  )
}
