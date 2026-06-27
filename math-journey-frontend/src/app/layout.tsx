import type { Metadata, Viewport } from 'next'
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tema-math-frontend.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Matema — Aprenda matemática se divertindo!',
    template: '%s · Matema',
  },
  description: 'Plataforma gamificada de matemática do básico ao ENEM. Aprenda no seu ritmo, ganhe recompensas e evolua.',
  keywords: ['matemática', 'ENEM', 'aprendizado', 'gamificação', 'ensino médio'],
  applicationName: 'Matema',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Matema',
    title: 'Matema — Aprenda matemática se divertindo!',
    description: 'Plataforma gamificada de matemática do básico ao ENEM.',
    images: [{ url: '/og-image.webp', width: 512, height: 512, alt: 'Matema' }],
  },
  twitter: {
    card: 'summary',
    title: 'Matema — Aprenda matemática se divertindo!',
    description: 'Plataforma gamificada de matemática do básico ao ENEM.',
    images: ['/og-image.webp'],
  },
}

export const viewport: Viewport = {
  themeColor: '#D4845A',
  colorScheme: 'light dark',
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
