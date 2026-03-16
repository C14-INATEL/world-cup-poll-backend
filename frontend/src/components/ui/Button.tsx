'use client'

import { ButtonHTMLAttributes } from 'react'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  loading?: boolean
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-accent-blue hover:bg-accent-blue/80 text-white',
  secondary:
    'border border-border bg-transparent hover:bg-bg-card text-text-primary',
  ghost:
    'bg-transparent hover:bg-bg-card text-text-secondary hover:text-text-primary',
}

export function Button({
  variant = 'primary',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}
