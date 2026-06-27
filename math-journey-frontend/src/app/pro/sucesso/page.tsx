import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export const metadata = { title: 'Pagamento recebido · Matema Pro' }

export default function ProSucessoPage() {
  return (
    <div className="animate-fade-in max-w-md mx-auto text-center py-12">
      <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" strokeWidth={1.5} />
      <h1 className="text-2xl font-extrabold text-matema-dark mb-2">Pagamento recebido!</h1>
      <p className="text-matema-muted text-sm mb-1">
        Estamos confirmando seu pagamento. O acesso Pro é liberado automaticamente assim que
        a confirmação chega (geralmente em segundos).
      </p>
      <p className="text-matema-muted text-sm mb-6">
        Se o Simulado ainda aparecer bloqueado, aguarde um instante e recarregue a página.
      </p>
      <div className="flex flex-col gap-2">
        <Link href="/ranqueada/jogar/simulado" className="bg-amber-500 text-white font-bold py-3 rounded-2xl hover:bg-amber-600 transition-colors">
          Ir para o Simulado ENEM
        </Link>
        <Link href="/pro" className="text-sm font-semibold text-matema-muted hover:text-matema-dark py-2">
          Ver meu status Pro
        </Link>
      </div>
    </div>
  )
}
