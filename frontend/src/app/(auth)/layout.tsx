'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Logo } from '@/components/ui/Logo'
import { Spinner } from '@/components/ui/Spinner'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-primary">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isAuthenticated) return null

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-primary px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 h-1/2 w-1/2 rounded-full bg-accent-green/5 blur-3xl" />
        <div className="absolute -right-1/4 -bottom-1/4 h-1/2 w-1/2 rounded-full bg-accent-gold/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>

        <div className="rounded-2xl border border-border bg-bg-secondary p-8 shadow-2xl shadow-black/20">
          {children}
        </div>

        <p className="mt-6 text-center text-xs text-text-secondary">
          Bolão da Copa do Mundo
        </p>
      </div>
    </div>
  )
}
