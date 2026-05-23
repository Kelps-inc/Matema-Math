import Link from 'next/link'
import { SignUpForm } from './SignUpForm'

export default function CadastroPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-matema-cream">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl text-matema-dark mb-10">
        <span className="text-2xl">📐</span>
        <span className="text-matema-primary">Matema</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-matema-border p-8 shadow-sm">
          <h1 className="text-2xl font-extrabold text-matema-dark mb-1">Criar sua conta</h1>
          <p className="text-matema-muted text-sm mb-8">Comece gratuitamente agora mesmo</p>

          <SignUpForm />

          <p className="text-center text-sm text-matema-muted mt-6">
            Já tem conta?{' '}
            <Link href="/entrar" className="text-matema-primary font-semibold hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
