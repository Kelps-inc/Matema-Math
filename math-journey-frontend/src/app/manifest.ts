import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Matema — Aprenda matemática se divertindo!',
    short_name: 'Matema',
    description: 'Plataforma gamificada de matemática do básico ao ENEM.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FDF6EC',
    theme_color: '#D4845A',
    lang: 'pt-BR',
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
