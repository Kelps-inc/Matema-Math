import type { Metadata } from 'next'
import { Nunito, Orbitron, Lora } from 'next/font/google'
import './globals.css'
import 'katex/dist/katex.min.css'
import { AudioManager } from '@/presentation/components/audio/AudioManager'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
})

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-orbitron-var',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora-var',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Matema — Aprenda matemática se divertindo!',
  description: 'Plataforma gamificada de matemática do básico ao ENEM. Aprenda no seu ritmo, ganhe recompensas e evolua.',
  keywords: ['matemática', 'ENEM', 'aprendizado', 'gamificação', 'ensino médio'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${nunito.variable} ${orbitron.variable} ${lora.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-matema-cream text-matema-dark antialiased">
        {/* Aplica tema escuro antes da hidratação para evitar flash */}
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('matema_theme')==='dark')document.documentElement.classList.add('dark')}catch{}` }} />
        <AudioManager />
        {children}
      </body>
    </html>
  )
}
