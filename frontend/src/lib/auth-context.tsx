'use client'

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { api, ApiError } from './api'
import { User } from '@/types/user'

type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    api
      .get<User>('/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await api.post<User>('/login', { email, password })
      setUser(data)
      router.push('/dashboard')
    },
    [router],
  )

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const data = await api.post<User>('/register', {
        name,
        email,
        password,
      })
      setUser(data)
      router.push('/dashboard')
    },
    [router],
  )

  const logout = useCallback(async () => {
    try {
      await api.post('/logout')
    } catch {
      // ignore errors on logout
    }
    setUser(null)
    router.push('/login')
  }, [router])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
