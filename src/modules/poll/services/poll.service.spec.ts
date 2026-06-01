import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PollService } from './poll.service'
import { PollRepository } from '../repositories/poll.repository'
import { ParticipantRepository } from '@/modules/participant/repositories/participant.repository'
import { BadRequestError } from '@/core/errors/error-handler'

describe('PollService', () => {
  let pollService: PollService
  let pollRepositoryMock: PollRepository
  let participantRepositoryMock: ParticipantRepository

  beforeEach(() => {
    // 1. Criamos os Mocks dos repositórios
    pollRepositoryMock = {
      create: vi.fn(),
      findByCode: vi.fn(),
    } as unknown as PollRepository
    participantRepositoryMock = {
      add: vi.fn(),
    } as unknown as ParticipantRepository

    // 2. Instanciamos o serviço passando os mocks (Injeção de Dependência)
    pollService = new PollService(pollRepositoryMock, participantRepositoryMock)
    
    // Limpar mocks antes de cada teste
    vi.clearAllMocks()
  })

  it('deve criar um bolão com sucesso', async () => {
    const pollData = { title: 'Bolão da Galera', code: 'COPA2026', ownerId: 'user-1' }
    const createdPoll = { id: 'poll-123', ...pollData }

    // Mockando: Dizemos que NÃO existe bolão com esse código e que o create retorna o bolão criado
    vi.spyOn(pollRepositoryMock, 'findByCode').mockResolvedValue(null)
    vi.spyOn(pollRepositoryMock, 'create').mockResolvedValue(createdPoll as any)
    vi.spyOn(participantRepositoryMock, 'add').mockResolvedValue(null as any)

    const result = await pollService.create(pollData as any)

    // Validação
    expect(result).toEqual(createdPoll)
    expect(pollRepositoryMock.create).toHaveBeenCalledWith(pollData)
    expect(participantRepositoryMock.add).toHaveBeenCalled()
  })

  it('deve lançar erro se o código do bolão já existir', async () => {
    const pollData = { title: 'Bolão Duplicado', code: 'EXISTENTE', ownerId: 'user-1' }

    // Mockando: Dizemos que o repositório ENCONTROU um bolão com esse código
    vi.spyOn(pollRepositoryMock, 'findByCode').mockResolvedValue({ id: '123' } as any)
    vi.spyOn(pollRepositoryMock, 'create')

    // Validação: Esperamos que o serviço lance um BadRequestError
    await expect(pollService.create(pollData as any)).rejects.toThrow(BadRequestError)
    
    // Garante que o create NUNCA foi chamado se o código já existia
    expect(pollRepositoryMock.create).not.toHaveBeenCalled()
  })
})