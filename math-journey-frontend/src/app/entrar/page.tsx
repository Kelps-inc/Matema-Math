import Link from 'next/link'
import Image from 'next/image'
import { SignInForm } from './SignInForm'

export default function EntrarPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-matema-cream">
      <Link href="/" className="mb-10">
        <Image src="/matema-logo.webp" alt="Matema" width={140} height={47} className="h-12 w-auto" priority />
      </Link>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-matema-border p-8 shadow-sm">
          <h1 className="text-2xl font-extrabold text-matema-dark mb-1">Bem-vindo de volta</h1>
          <p className="text-matema-muted text-sm mb-8">Continue sua jornada matemática</p>

          <SignInForm />

          <p className="text-center text-sm text-matema-muted mt-6">
            Não tem conta?{' '}
            <Link href="/cadastro" className="text-matema-primary font-semibold hover:underline">
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
