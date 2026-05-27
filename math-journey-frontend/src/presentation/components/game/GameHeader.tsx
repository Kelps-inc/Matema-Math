import Link from 'next/link'
import { signOut } from '@/app/actions/auth'
import { MobileBottomNav } from '@/presentation/components/game/MobileBottomNav'
import type { User } from '@/domain/user/entities/User'

interface GameHeaderProps {
  user: User
}

export function GameHeader({ user }: GameHeaderProps) {
  return (
    <>
    <header
      className="border-b border-white/10 sticky top-0 z-50 relative"
      style={{ backgroundImage: 'url(/header-bg.png)', backgroundSize: 'cover', backgroundPosition: 'left center' }}
    >
      {/* Logo posicionada absolutamente sobre a faixa laranja */}
      <Link href="/dashboard" className="absolute left-10 top-1/2 -translate-y-1/2 select-none z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/matema-logo.png" alt="Matema" style={{ height: '80px', width: 'auto', display: 'block' }} />
      </Link>

      <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between gap-4">

        {/* Espaço reservado para a logo não sobrepor o nav */}
        <div className="shrink-0 w-20" />

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-1">
          <Link href="/modulos" className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            Tutorial
          </Link>
          <Link href="/loja" className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            Loja
          </Link>
          <Link href="/ranqueada" className="flex flex-col items-center justify-center gap-0.5 px-5 py-1.5 font-bold text-orange-400 border-2 border-orange-400/60 bg-orange-400/10 hover:bg-orange-400/20 rounded-xl transition-colors shadow-[0_2px_12px_rgba(251,146,60,0.3)]">
            <span className="text-xl leading-none">🏆</span>
            <span className="text-sm leading-none">Ranqueada</span>
          </Link>
          <Link href="/avatar" className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            Avatar
          </Link>
          <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            Progresso
          </Link>
        </nav>

        {/* Stats + user */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 bg-black/30 border border-white/15 rounded-2xl px-4 py-2">
            <div className="flex items-center gap-1.5">
              <span>⚡</span>
              <span className="text-sm font-bold text-white">{user.xp.toLocaleString('pt-BR')}</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-1.5">
              <span>🪙</span>
              <span className="text-sm font-bold text-white">{user.coins}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-base font-bold text-white">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-white leading-none">{user.displayName}</p>
              <p className="text-xs text-white/60 leading-none">Nível {user.level}</p>
            </div>
          </div>

          <Link
            href="/configuracoes"
            className="text-xs text-white/60 hover:text-white px-3 py-2 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-1"
          >
            <span>Config</span>
            <span aria-hidden>⚙️</span>
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              className="text-xs text-white/60 hover:text-white px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
    <MobileBottomNav />
    </>
  )
}
