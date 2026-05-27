import Link from 'next/link'
import Image from 'next/image'
import { SignUpForm } from './SignUpForm'

export default function CadastroPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-matema-cream">
      <Link href="/" className="mb-10">
        <Image src="/logo.png" alt="Matema" width={140} height={47} className="h-12 w-auto" priority />
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
