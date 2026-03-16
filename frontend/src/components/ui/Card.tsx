import { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-bg-secondary p-6 ${className}`}
    >
      {children}
    </div>
  )
}
