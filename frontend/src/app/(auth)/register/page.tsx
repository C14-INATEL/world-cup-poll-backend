'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ApiError } from '@/lib/api'

export default function RegisterPage() {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function validate() {
    const errors: Record<string, string> = {}
    if (!name.trim()) errors.name = 'O nome é obrigatório'
    if (!email.trim()) errors.email = 'O e-mail é obrigatório'
    if (password.length < 6)
      errors.password = 'A senha deve ter no mínimo 6 caracteres'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!validate()) return

    setLoading(true)

    try {
      await register(name, email, password)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro ao cadastrar. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-text-primary">
          Criar conta
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Cadastre-se para participar de bolões
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <Input
        label="Nome"
        type="text"
        placeholder="Seu nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={fieldErrors.name}
        required
      />

      <Input
        label="E-mail"
        type="email"
        placeholder="seu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
        required
      />

      <Input
        label="Senha"
        type="password"
        placeholder="Mínimo 6 caracteres"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        required
      />

      <Button type="submit" loading={loading} className="mt-2 w-full">
        Cadastrar
      </Button>

      <p className="text-center text-sm text-text-secondary">
        Já tem conta?{' '}
        <Link
          href="/login"
          className="font-medium text-accent-blue hover:underline"
        >
          Entrar
        </Link>
      </p>
    </form>
  )
}
