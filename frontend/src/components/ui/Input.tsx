'use client'

import { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export function Input({
  label,
  error,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-text-secondary"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`rounded-lg border bg-bg-primary px-4 py-2.5 text-text-primary placeholder-text-secondary/50 outline-none transition-colors focus:border-accent-blue ${
          error ? 'border-error' : 'border-border'
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="text-sm text-error">{error}</span>
      )}
    </div>
  )
}
