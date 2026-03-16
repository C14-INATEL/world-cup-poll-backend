'use client'

import { Trophy, Target, Star, CalendarDays, Users } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/Card'

const stats = [
  {
    label: 'Meus Bolões',
    value: '0',
    icon: Trophy,
    color: 'text-accent-gold',
  },
  {
    label: 'Palpites Feitos',
    value: '0',
    icon: Target,
    color: 'text-accent-green',
  },
  {
    label: 'Pontuação Total',
    value: '0',
    icon: Star,
    color: 'text-accent-blue',
  },
]

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">
          Bem-vindo, {user?.name}!
        </h1>
        <p className="mt-1 text-text-secondary">
          Acompanhe seus bolões e palpites da Copa do Mundo
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-bg-card ${stat.color}`}
                >
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays size={20} className="text-accent-green" />
            <h2 className="text-lg font-semibold">Próximos Jogos</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-text-secondary">
            <CalendarDays size={48} className="mb-3 opacity-30" />
            <p className="text-sm">Nenhum jogo agendado</p>
            <p className="text-xs opacity-60">
              Os jogos aparecerão aqui quando disponíveis
            </p>
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Users size={20} className="text-accent-gold" />
            <h2 className="text-lg font-semibold">Bolões Recentes</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-text-secondary">
            <Trophy size={48} className="mb-3 opacity-30" />
            <p className="text-sm">Você ainda não participa de nenhum bolão</p>
            <p className="text-xs opacity-60">
              Crie ou entre em um bolão para começar
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
