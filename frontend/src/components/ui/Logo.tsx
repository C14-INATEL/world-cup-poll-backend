import { Trophy } from 'lucide-react'

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { icon: 20, text: 'text-lg' },
    md: { icon: 28, text: 'text-2xl' },
    lg: { icon: 36, text: 'text-3xl' },
  }

  const s = sizes[size]

  return (
    <div className="flex items-center gap-2">
      <Trophy size={s.icon} className="text-accent-gold" />
      <span className={`${s.text} font-bold text-text-primary`}>
        World Cup<span className="text-accent-blue">.Poll</span>
      </span>
    </div>
  )
}
