'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Trophy,
  Gamepad2,
  Medal,
  LogOut,
  X,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/hooks/useAuth'

type SidebarProps = {
  open: boolean
  onClose: () => void
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '#', label: 'Meus Bolões', icon: Trophy, disabled: true },
  { href: '#', label: 'Jogos', icon: Gamepad2, disabled: true },
  { href: '#', label: 'Ranking', icon: Medal, disabled: true },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-64 flex-col border-r border-border bg-bg-sidebar transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-5">
          <Logo size="sm" />
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary lg:hidden cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      if (item.disabled) e.preventDefault()
                      else onClose()
                    }}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-accent-blue/10 text-accent-blue'
                        : item.disabled
                          ? 'cursor-not-allowed text-text-secondary/40'
                          : 'text-text-secondary hover:bg-bg-card hover:text-text-primary'
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                    {item.disabled && (
                      <span className="ml-auto rounded bg-bg-card px-1.5 py-0.5 text-[10px] text-text-secondary/60">
                        Em breve
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-card hover:text-error cursor-pointer"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
