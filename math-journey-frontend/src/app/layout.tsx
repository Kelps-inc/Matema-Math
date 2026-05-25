import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'
import { AudioManager } from '@/presentation/components/audio/AudioManager'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Matema — Aprenda matemática de um jeito que faz sentido',
  description: 'Plataforma gamificada de matemática do básico ao ENEM. Aprenda no seu ritmo, ganhe recompensas e evolua.',
  keywords: ['matemática', 'ENEM', 'aprendizado', 'gamificação', 'ensino médio'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={nunito.variable}>
      <body className="min-h-screen bg-matema-cream text-matema-dark antialiased">
        {/* Aplica tema escuro antes da hidratação para evitar flash */}
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('matema_theme')==='dark')document.documentElement.classList.add('dark')}catch{}` }} />
        <AudioManager />
        {children}
      </body>
    </html>
  )
}
