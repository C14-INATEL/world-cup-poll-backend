import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
	BadRequestError,
	NotFoundError,
	UnauthorizedError,
} from '@/core/errors/error-handler'
import { GuessService } from '@/modules/guess/services/guess.service'
import { makeGame } from '../factories/game/make-game'
import { makeGuess } from '../factories/guess/make-guess'
import { makeParticipant } from '../factories/participant/make-participant'

describe('GuessService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	describe('create', () => {
		test('deve lançar BadRequestError se usuário não é participante do bolão', async () => {
			const participantRepository = {
				findByUserIdAndPollId: vi.fn().mockResolvedValue(null),
			}

			const service = new GuessService(
				{} as any,
				{} as any,
				participantRepository as any,
			)

			await expect(
				service.create(
					{ gameId: 'game-1', firstTeamPoints: 1, secondTeamPoints: 0 },
					'user-1',
					'poll-1',
				),
			).rejects.toThrow(BadRequestError)

			expect(participantRepository.findByUserIdAndPollId).toHaveBeenCalledWith(
				'user-1',
				'poll-1',
			)
		})

		test('deve lançar NotFoundError se jogo não existe', async () => {
			const participantRepository = {
				findByUserIdAndPollId: vi.fn().mockResolvedValue(makeParticipant()),
			}

			const gameRepository = {
				findById: vi.fn().mockResolvedValue(null),
			}

			const service = new GuessService(
				{} as any,
				gameRepository as any,
				participantRepository as any,
			)

			await expect(
				service.create(
					{ gameId: 'game-1', firstTeamPoints: 1, secondTeamPoints: 0 },
					'user-1',
					'poll-1',
				),
			).rejects.toThrow(NotFoundError)
		})

		test('deve lançar BadRequestError se a data do jogo já passou', async () => {
			vi.useFakeTimers()
			vi.setSystemTime(new Date('2026-06-01T12:00:00.000Z'))

			const participantRepository = {
				findByUserIdAndPollId: vi.fn().mockResolvedValue(makeParticipant()),
			}

			const gameRepository = {
				findById: vi
					.fn()
					.mockResolvedValue(
						makeGame({ date: new Date('2026-06-01T10:00:00.000Z') }),
					),
			}

			const service = new GuessService(
				{} as any,
				gameRepository as any,
				participantRepository as any,
			)

			await expect(
				service.create(
					{ gameId: 'game-1', firstTeamPoints: 1, secondTeamPoints: 0 },
					'user-1',
					'poll-1',
				),
			).rejects.toThrow(BadRequestError)
		})

		test('deve criar palpite com o participantId correto', async () => {
			const participant = makeParticipant({ id: 'participant-99' })

			const participantRepository = {
				findByUserIdAndPollId: vi.fn().mockResolvedValue(participant),
			}

			const gameRepository = {
				findById: vi.fn().mockResolvedValue(makeGame()),
			}

			const guessRepository = {
				create: vi
					.fn()
					.mockResolvedValue(makeGuess({ participantId: 'participant-99' })),
			}

			const service = new GuessService(
				guessRepository as any,
				gameRepository as any,
				participantRepository as any,
			)

			await service.create(
				{ gameId: 'game-1', firstTeamPoints: 2, secondTeamPoints: 1 },
				'user-1',
				'poll-1',
			)

			expect(guessRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({ participantId: 'participant-99' }),
			)
		})
	})

	describe('update', () => {
		test('deve lançar BadRequestError se usuário não é participante do bolão', async () => {
			const participantRepository = {
				findByUserIdAndPollId: vi.fn().mockResolvedValue(null),
			}

			const service = new GuessService(
				{} as any,
				{} as any,
				participantRepository as any,
			)

			await expect(
				service.update({
					data: { firstTeamPoints: 1 },
					guessId: 'guess-1',
					pollId: 'poll-1',
					userId: 'user-1',
				}),
			).rejects.toThrow(BadRequestError)
		})

		test('deve lançar NotFoundError se palpite não existe', async () => {
			const participantRepository = {
				findByUserIdAndPollId: vi.fn().mockResolvedValue(makeParticipant()),
			}

			const guessRepository = {
				findById: vi.fn().mockResolvedValue(null),
			}

			const service = new GuessService(
				guessRepository as any,
				{} as any,
				participantRepository as any,
			)

			await expect(
				service.update({
					data: { firstTeamPoints: 1 },
					guessId: 'guess-1',
					pollId: 'poll-1',
					userId: 'user-1',
				}),
			).rejects.toThrow(NotFoundError)
		})

		test('deve lançar UnauthorizedError se palpite pertence a outro participante', async () => {
			const participantRepository = {
				findByUserIdAndPollId: vi
					.fn()
					.mockResolvedValue(makeParticipant({ id: 'participant-A' })),
			}

			const guessRepository = {
				findById: vi
					.fn()
					.mockResolvedValue(makeGuess({ participantId: 'participant-B' })),
			}

			const service = new GuessService(
				guessRepository as any,
				{} as any,
				participantRepository as any,
			)

			await expect(
				service.update({
					data: { firstTeamPoints: 1 },
					guessId: 'guess-1',
					pollId: 'poll-1',
					userId: 'user-1',
				}),
			).rejects.toThrow(UnauthorizedError)
		})

		test('deve lançar NotFoundError se jogo não existe', async () => {
			const participantRepository = {
				findByUserIdAndPollId: vi.fn().mockResolvedValue(makeParticipant()),
			}

			const guessRepository = {
				findById: vi.fn().mockResolvedValue(makeGuess()),
			}

			const gameRepository = {
				findById: vi.fn().mockResolvedValue(null),
			}

			const service = new GuessService(
				guessRepository as any,
				gameRepository as any,
				participantRepository as any,
			)

			await expect(
				service.update({
					data: { firstTeamPoints: 1 },
					guessId: 'guess-1',
					pollId: 'poll-1',
					userId: 'user-1',
				}),
			).rejects.toThrow(NotFoundError)
		})

		test('deve lançar BadRequestError se a data do jogo já passou', async () => {
			vi.useFakeTimers()
			vi.setSystemTime(new Date('2026-06-01T12:00:00.000Z'))

			const participantRepository = {
				findByUserIdAndPollId: vi.fn().mockResolvedValue(makeParticipant()),
			}

			const guessRepository = {
				findById: vi.fn().mockResolvedValue(makeGuess()),
			}

			const gameRepository = {
				findById: vi
					.fn()
					.mockResolvedValue(
						makeGame({ date: new Date('2026-06-01T10:00:00.000Z') }),
					),
			}

			const service = new GuessService(
				guessRepository as any,
				gameRepository as any,
				participantRepository as any,
			)

			await expect(
				service.update({
					data: { firstTeamPoints: 1 },
					guessId: 'guess-1',
					pollId: 'poll-1',
					userId: 'user-1',
				}),
			).rejects.toThrow(BadRequestError)
		})

		test('deve atualizar palpite com sucesso', async () => {
			const participantRepository = {
				findByUserIdAndPollId: vi.fn().mockResolvedValue(makeParticipant()),
			}

			const guessRepository = {
				findById: vi.fn().mockResolvedValue(makeGuess()),
				update: vi
					.fn()
					.mockResolvedValue(makeGuess({ firstTeamPoints: 3, secondTeamPoints: 1 })),
			}

			const gameRepository = {
				findById: vi.fn().mockResolvedValue(makeGame()),
			}

			const service = new GuessService(
				guessRepository as any,
				gameRepository as any,
				participantRepository as any,
			)

			await service.update({
				data: { firstTeamPoints: 3, secondTeamPoints: 1 },
				guessId: 'guess-1',
				pollId: 'poll-1',
				userId: 'user-1',
			})

			expect(guessRepository.update).toHaveBeenCalledWith({
				id: 'guess-1',
				guess: { firstTeamPoints: 3, secondTeamPoints: 1 },
			})
		})
	})
})
