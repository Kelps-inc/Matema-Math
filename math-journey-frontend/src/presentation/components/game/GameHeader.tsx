import Link from 'next/link'
import { signOut } from '@/app/actions/auth'
import { ProgressBar } from '@/presentation/components/ui/ProgressBar'
import type { User } from '@/domain/user/entities/User'

interface GameHeaderProps {
  user: User
}

export function GameHeader({ user }: GameHeaderProps) {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-matema-border sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-matema-dark text-xl">
          <span className="text-2xl">📐</span>
          <span className="text-matema-primary">Matema</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          <Link href="/modulos" className="px-4 py-2 text-sm font-medium text-matema-muted hover:text-matema-dark hover:bg-matema-warm rounded-xl transition-colors">
            Módulos
          </Link>
          <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-matema-muted hover:text-matema-dark hover:bg-matema-warm rounded-xl transition-colors">
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 bg-matema-cream border border-matema-border rounded-2xl px-4 py-2">
            <div className="flex items-center gap-1.5">
              <span>⚡</span>
              <span className="text-sm font-bold text-matema-dark">{user.xp.toLocaleString('pt-BR')}</span>
            </div>
            <div className="w-px h-4 bg-matema-border" />
            <div className="flex items-center gap-1.5">
              <span>🪙</span>
              <span className="text-sm font-bold text-matema-dark">{user.coins}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-matema-primary/10 rounded-full flex items-center justify-center text-base">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-matema-dark leading-none">{user.displayName}</p>
              <p className="text-xs text-matema-muted leading-none">Nível {user.level}</p>
            </div>
          </div>

          <form action={signOut}>
            <button
              type="submit"
              className="text-xs text-matema-muted hover:text-matema-dark px-3 py-2 rounded-xl hover:bg-matema-warm transition-colors"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
