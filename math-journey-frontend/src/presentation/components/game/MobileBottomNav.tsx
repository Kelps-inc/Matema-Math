'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/presentation/lib/utils'
import { BookOpen, ShoppingBag, Trophy, UserRound, BarChart2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const navItems: { href: string; icon: LucideIcon; label: string; featured?: boolean }[] = [
  { href: '/modulos',   icon: BookOpen,      label: 'Tutorial'  },
  { href: '/loja',      icon: ShoppingBag,   label: 'Loja'      },
  { href: '/ranqueada', icon: Trophy,        label: 'Ranqueada', featured: true },
  { href: '/avatar',    icon: UserRound,     label: 'Avatar'    },
  { href: '/dashboard', icon: BarChart2,     label: 'Progresso' },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 z-40 bg-white border-t border-matema-border sm:hidden overflow-visible">
      <div className="flex items-end justify-around h-full px-1 pb-1">
        {navItems.map(({ href, icon: Icon, label, featured }) => {
          const active = pathname === href || pathname.startsWith(href + '/')

          if (featured) {
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-0.5 flex-1 py-2.5 px-2 rounded-2xl transition-all',
                  '-translate-y-4 border-2 shadow-[0_-4px_16px_rgba(251,146,60,0.25)]',
                  active
                    ? 'border-orange-400 bg-gradient-to-b from-orange-100 to-amber-50 text-orange-500 shadow-[0_-4px_20px_rgba(251,146,60,0.4)]'
                    : 'border-orange-300 bg-gradient-to-b from-orange-50 to-amber-50/80 text-orange-400',
                )}
              >
                <Icon className="w-6 h-6" strokeWidth={1.75} />
                <span className="text-xs font-extrabold leading-none tracking-wide">{label}</span>
              </Link>
            )
          }

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 flex-1 py-2 rounded-xl transition-colors',
                active ? 'text-matema-primary' : 'text-matema-muted',
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={1.75} />
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
