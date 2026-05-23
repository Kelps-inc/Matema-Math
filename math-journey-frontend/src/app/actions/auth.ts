'use server'

import { createClient } from '@/infrastructure/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const SignUpSchema = z.object({
  displayName: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
})

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function signUp(_: unknown, formData: FormData) {
  const raw = {
    displayName: formData.get('displayName'),
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = SignUpSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: 'Dados inválidos. Verifique os campos.' }
  }

  const { displayName, email, password } = parsed.data
  const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName, username },
    },
  })

  if (error) {
    return { error: error.message === 'User already registered'
      ? 'Este e-mail já está cadastrado.'
      : 'Erro ao criar conta. Tente novamente.' }
  }

  redirect('/dashboard')
}

export async function signIn(_: unknown, formData: FormData) {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = SignInSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: 'E-mail ou senha inválidos.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { error: 'E-mail ou senha incorretos.' }
  }

  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/entrar')
}
