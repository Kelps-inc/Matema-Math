import Link from 'next/link'
import { signOut } from '@/app/actions/auth'
import { MobileBottomNav } from '@/presentation/components/game/MobileBottomNav'
import { LogoWithEyes } from '@/presentation/components/game/LogoWithEyes'
import { NinjaIcon } from '@/presentation/components/game/NinjaIcon'
import { Zap, Coins, Trophy, Settings } from 'lucide-react'
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
      <Link href="/" className="absolute left-[4.5%] top-1/2 -translate-y-1/2 select-none z-10">
        <LogoWithEyes level={user.level} height={65} />
      </Link>

      <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-2">
        <div className="shrink-0 w-20" />

        <nav className="hidden sm:flex items-center gap-0.5">
          <Link href="/modulos" className="px-3 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            Treinamento
          </Link>
          <Link href="/loja" className="px-3 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            Loja
          </Link>
          <Link href="/ranqueada" className="flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 font-bold text-orange-400 border-2 border-orange-400/60 bg-orange-400/10 hover:bg-orange-400/20 rounded-xl transition-colors shadow-[0_2px_12px_rgba(251,146,60,0.3)]">
            <Trophy className="w-5 h-5" strokeWidth={1.75} />
            <span className="text-sm leading-none">Ranqueada</span>
          </Link>
          <Link href="/duelo" className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 font-bold text-matema-accent/90 border-2 border-matema-accent/40 bg-matema-accent/10 hover:bg-matema-accent/20 rounded-xl transition-colors shadow-[0_2px_10px_rgba(139,124,196,0.2)]">
            <NinjaIcon className="w-4 h-4" strokeWidth={1.75} />
            <span className="text-xs leading-none">Duelo</span>
          </Link>
          <Link href="/avatar" className="px-3 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            Avatar
          </Link>
          <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            Progresso
          </Link>
          <Link href="/leaderboard" className="px-3 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            Ranking
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-3 bg-black/30 border border-white/15 rounded-2xl px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-yellow-400 shrink-0" strokeWidth={2} />
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold text-white">{user.xp.toLocaleString('pt-BR')}</span>
                <span className="text-[10px] text-white/50 font-medium">XP</span>
              </div>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div className="flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-400 shrink-0" strokeWidth={2} />
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold text-white">{user.coins}</span>
                <span className="text-[10px] text-white/50 font-medium">Matecoins</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-semibold text-white leading-none">{user.displayName}</p>
              <p className="text-xs text-white/60 leading-none">Nível {user.level}</p>
            </div>
          </div>

          <Link
            href="/configuracoes"
            className="text-white/60 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
            title="Configurações"
          >
            <Settings className="w-4 h-4" strokeWidth={2} />
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              className="text-xs text-white/60 hover:text-white px-2.5 py-2 rounded-xl hover:bg-white/10 transition-colors"
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
