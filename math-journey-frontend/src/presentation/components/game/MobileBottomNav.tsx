'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/presentation/lib/utils'

const navItems = [
  { href: '/modulos',   icon: '📚', label: 'Tutorial'  },
  { href: '/ranqueada', icon: '🏆', label: 'Ranqueada' },
  { href: '/loja',      icon: '🛍️',  label: 'Loja'      },
  { href: '/avatar',    icon: '🎭', label: 'Avatar'    },
  { href: '/dashboard', icon: '📊', label: 'Progresso' },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 z-40 bg-white border-t border-matema-border sm:hidden overflow-hidden">
      <div className="flex items-center justify-around h-full px-1">
        {navItems.map(({ href, icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 flex-1 py-2 rounded-xl transition-colors',
                active ? 'text-matema-primary' : 'text-matema-muted',
              )}
            >
              <span className="text-xl leading-none">{icon}</span>
              <span className={cn(
                'text-[10px] font-bold leading-none',
                active ? 'text-matema-primary' : 'text-matema-muted',
              )}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
