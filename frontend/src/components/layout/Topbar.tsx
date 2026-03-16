'use client'

import { Menu, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

type TopbarProps = {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuth()

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-bg-sidebar px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="text-text-secondary hover:text-text-primary lg:hidden cursor-pointer"
      >
        <Menu size={24} />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <span className="text-sm text-text-secondary">
          {user?.name}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-blue/20 text-accent-blue">
          <User size={16} />
        </div>
      </div>
    </header>
  )
}
