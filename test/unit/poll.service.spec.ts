import { beforeEach, describe, expect, test, vi } from 'vitest'
import { BadRequestError, NotFoundError, UnauthorizedError } from '@/core/errors/error-handler'
import { PollService } from '@/modules/poll/services/poll.service'
import { makePoll } from '../factories/poll/make-poll'

describe('PollService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('create', () => {
		test('deve lançar BadRequestError se já existe um bolão com o mesmo código', async () => {
			const pollRepository = {
				findByCode: vi.fn().mockResolvedValue(makePoll()),
				create: vi.fn(),
			}

			const participantRepository = {
				add: vi.fn(),
			}

			const service = new PollService(
				pollRepository as any,
				participantRepository as any,
			)

			await expect(
				service.create({ title: 'Novo Bolão', code: 'ABC123DEF4', ownerId: 'user-1' }),
			).rejects.toThrow(BadRequestError)

			expect(pollRepository.create).not.toHaveBeenCalled()
			expect(participantRepository.add).not.toHaveBeenCalled()
		})

		test('deve criar o bolão quando o código é único', async () => {
			const poll = makePoll({ id: 'poll-99', ownerId: 'user-1' })

			const pollRepository = {
				findByCode: vi.fn().mockResolvedValue(null),
				create: vi.fn().mockResolvedValue(poll),
			}

			const participantRepository = {
				add: vi.fn().mockResolvedValue({ id: 'participant-1', pollId: poll.id, userId: poll.ownerId }),
			}

			const service = new PollService(
				pollRepository as any,
				participantRepository as any,
			)

			const result = await service.create({ title: 'Novo Bolão', code: 'ABC123DEF4', ownerId: 'user-1' })

			expect(pollRepository.create).toHaveBeenCalledOnce()
			expect(result).toEqual(poll)
		})

		test('deve inserir o owner como participante ao criar o bolão', async () => {
			const poll = makePoll({ id: 'poll-99', ownerId: 'user-42' })

			const pollRepository = {
				findByCode: vi.fn().mockResolvedValue(null),
				create: vi.fn().mockResolvedValue(poll),
			}

			const participantRepository = {
				add: vi.fn().mockResolvedValue({ id: 'participant-1', pollId: poll.id, userId: poll.ownerId }),
			}

			const service = new PollService(
				pollRepository as any,
				participantRepository as any,
			)

			await service.create({ title: 'Novo Bolão', code: 'ABC123DEF4', ownerId: 'user-42' })

			expect(participantRepository.add).toHaveBeenCalledOnce()
			expect(participantRepository.add).toHaveBeenCalledWith({
				pollId: poll.id,
				userId: poll.ownerId,
			})
		})

		test('deve retornar o bolão criado mesmo após inserir o participante', async () => {
			const poll = makePoll({ title: 'Meu Bolão' })

			const pollRepository = {
				findByCode: vi.fn().mockResolvedValue(null),
				create: vi.fn().mockResolvedValue(poll),
			}

			const participantRepository = {
				add: vi.fn().mockResolvedValue({ id: 'participant-1' }),
			}

			const service = new PollService(
				pollRepository as any,
				participantRepository as any,
			)

			const result = await service.create({ title: 'Meu Bolão', code: 'ABC123DEF4', ownerId: 'user-1' })

			expect(result.title).toBe('Meu Bolão')
			expect(result).toEqual(poll)
		})
	})

	describe('updateTitle', () => {
		test('deve lançar NotFoundError se o bolão não existe', async () => {
			const pollRepository = {
				findById: vi.fn().mockResolvedValue(null),
				updateTitle: vi.fn(),
			}

			const service = new PollService(pollRepository as any, {} as any)

			await expect(
				service.updateTitle('poll-inexistente', 'Novo Título', 'user-1'),
			).rejects.toThrow(NotFoundError)

			expect(pollRepository.updateTitle).not.toHaveBeenCalled()
		})

		test('deve lançar UnauthorizedError se o usuário não é o dono do bolão', async () => {
			const poll = makePoll({ ownerId: 'user-dono' })

			const pollRepository = {
				findById: vi.fn().mockResolvedValue(poll),
				updateTitle: vi.fn(),
			}

			const service = new PollService(pollRepository as any, {} as any)

			await expect(
				service.updateTitle(poll.id, 'Novo Título', 'user-outro'),
			).rejects.toThrow(UnauthorizedError)

			expect(pollRepository.updateTitle).not.toHaveBeenCalled()
		})

		test('deve atualizar o título quando o usuário é o dono', async () => {
			const poll = makePoll({ id: 'poll-1', ownerId: 'user-1' })
			const updatedPoll = { ...poll, title: 'Título Atualizado' }

			const pollRepository = {
				findById: vi.fn().mockResolvedValue(poll),
				updateTitle: vi.fn().mockResolvedValue(updatedPoll),
			}

			const service = new PollService(pollRepository as any, {} as any)

			const result = await service.updateTitle('poll-1', 'Título Atualizado', 'user-1')

			expect(pollRepository.updateTitle).toHaveBeenCalledWith('poll-1', 'Título Atualizado')
			expect(result.title).toBe('Título Atualizado')
		})

		test('deve verificar o bolão pelo id correto', async () => {
			const poll = makePoll({ id: 'poll-especifico', ownerId: 'user-1' })

			const pollRepository = {
				findById: vi.fn().mockResolvedValue(poll),
				updateTitle: vi.fn().mockResolvedValue(poll),
			}

			const service = new PollService(pollRepository as any, {} as any)

			await service.updateTitle('poll-especifico', 'Qualquer Título', 'user-1')

			expect(pollRepository.findById).toHaveBeenCalledWith('poll-especifico')
		})
	})

	describe('delete', () => {
		test('deve lançar NotFoundError se o bolão não existe', async () => {
			const pollRepository = {
				findById: vi.fn().mockResolvedValue(null),
				delete: vi.fn(),
			}

			const service = new PollService(pollRepository as any, {} as any)

			await expect(
				service.delete('poll-inexistente', 'user-1'),
			).rejects.toThrow(NotFoundError)

			expect(pollRepository.delete).not.toHaveBeenCalled()
		})

		test('deve lançar UnauthorizedError se o usuário não é o dono do bolão', async () => {
			const poll = makePoll({ ownerId: 'user-dono' })

			const pollRepository = {
				findById: vi.fn().mockResolvedValue(poll),
				delete: vi.fn(),
			}

			const service = new PollService(pollRepository as any, {} as any)

			await expect(
				service.delete(poll.id, 'user-outro'),
			).rejects.toThrow(UnauthorizedError)

			expect(pollRepository.delete).not.toHaveBeenCalled()
		})

		test('deve excluir o bolão quando o usuário é o dono', async () => {
			const poll = makePoll({ id: 'poll-1', ownerId: 'user-1' })

			const pollRepository = {
				findById: vi.fn().mockResolvedValue(poll),
				delete: vi.fn().mockResolvedValue(poll),
			}

			const service = new PollService(pollRepository as any, {} as any)

			await service.delete('poll-1', 'user-1')

			expect(pollRepository.delete).toHaveBeenCalledWith('poll-1')
		})

		test('deve verificar o bolão pelo id correto antes de excluir', async () => {
			const poll = makePoll({ id: 'poll-alvo', ownerId: 'user-1' })

			const pollRepository = {
				findById: vi.fn().mockResolvedValue(poll),
				delete: vi.fn().mockResolvedValue(poll),
			}

			const service = new PollService(pollRepository as any, {} as any)

			await service.delete('poll-alvo', 'user-1')

			expect(pollRepository.findById).toHaveBeenCalledWith('poll-alvo')
		})

		test('não deve permitir que um participante (não dono) exclua o bolão', async () => {
			const poll = makePoll({ ownerId: 'user-dono' })

			const pollRepository = {
				findById: vi.fn().mockResolvedValue(poll),
				delete: vi.fn(),
			}

			const service = new PollService(pollRepository as any, {} as any)

			await expect(
				service.delete(poll.id, 'user-participante'),
			).rejects.toThrow(UnauthorizedError)

			expect(pollRepository.delete).not.toHaveBeenCalled()
		})
	})
})
