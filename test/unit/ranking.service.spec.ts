import { beforeEach, describe, expect, test, vi } from 'vitest'
import { NotFoundError, UnauthorizedError } from '@/core/errors/error-handler'
import { RankingService } from '@/modules/ranking/services/ranking.service'
import { makeParticipant } from '../factories/participant/make-participant'

function makePoll(overrides = {}) {
	return {
		id: 'poll-1',
		title: 'Bolão Teste',
		code: 'ABC123',
		ownerId: 'owner-1',
		createdAt: new Date(),
		...overrides,
	}
}

function makeRankingRow(overrides = {}) {
	return {
		participantId: 'participant-1',
		userId: 'user-1',
		name: 'Alice',
		guessFirstTeamPoints: 1,
		guessSecondTeamPoints: 0,
		gameFirstTeamGoals: 1,
		gameSecondTeamGoals: 0,
		...overrides,
	}
}

describe('RankingService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('getRanking', () => {
		test('deve lançar NotFoundError quando o bolão não existe', async () => {
			const pollRepository = {
				findById: vi.fn().mockResolvedValue(null),
			}

			const participantRepository = {
				findByUserIdAndPollId: vi.fn().mockResolvedValue(null),
			}

			const service = new RankingService(
				{} as any,
				pollRepository as any,
				participantRepository as any,
			)

			await expect(service.getRanking('poll-1', 'user-1')).rejects.toThrow(
				NotFoundError,
			)
		})

		test('deve lançar UnauthorizedError quando o usuário não é dono nem participante', async () => {
			const pollRepository = {
				findById: vi.fn().mockResolvedValue(makePoll({ ownerId: 'owner-1' })),
			}

			const participantRepository = {
				findByUserIdAndPollId: vi.fn().mockResolvedValue(null),
			}

			const service = new RankingService(
				{} as any,
				pollRepository as any,
				participantRepository as any,
			)

			await expect(service.getRanking('poll-1', 'user-99')).rejects.toThrow(
				UnauthorizedError,
			)
		})

		test('deve permitir acesso ao dono do bolão mesmo sem ser participante', async () => {
			const pollRepository = {
				findById: vi.fn().mockResolvedValue(makePoll({ ownerId: 'owner-1' })),
			}

			const participantRepository = {
				findByUserIdAndPollId: vi.fn().mockResolvedValue(null),
			}

			const rankingRepository = {
				findParticipantsWithGuessesAndResults: vi.fn().mockResolvedValue([]),
			}

			const service = new RankingService(
				rankingRepository as any,
				pollRepository as any,
				participantRepository as any,
			)

			await expect(service.getRanking('poll-1', 'owner-1')).resolves.toEqual([])
		})

		test('deve calcular os pontos totais corretamente', async () => {
			const pollRepository = {
				findById: vi.fn().mockResolvedValue(makePoll({ ownerId: 'owner-1' })),
			}

			const participantRepository = {
				findByUserIdAndPollId: vi.fn().mockResolvedValue(makeParticipant()),
			}

			const rankingRepository = {
				// Two rows for the same participant: exact score (5pts) + wrong outcome (0pts)
				findParticipantsWithGuessesAndResults: vi.fn().mockResolvedValue([
					makeRankingRow({
						participantId: 'p-1',
						userId: 'user-1',
						name: 'Alice',
						guessFirstTeamPoints: 2,
						guessSecondTeamPoints: 1,
						gameFirstTeamGoals: 2,
						gameSecondTeamGoals: 1,
					}),
					makeRankingRow({
						participantId: 'p-1',
						userId: 'user-1',
						name: 'Alice',
						guessFirstTeamPoints: 3,
						guessSecondTeamPoints: 0,
						gameFirstTeamGoals: 0,
						gameSecondTeamGoals: 2,
					}),
				]),
			}

			const service = new RankingService(
				rankingRepository as any,
				pollRepository as any,
				participantRepository as any,
			)

			const ranking = await service.getRanking('poll-1', 'user-1')

			expect(ranking).toHaveLength(1)
			expect(ranking[0]).toMatchObject({
				position: 1,
				userId: 'user-1',
				name: 'Alice',
				totalPoints: 5,
				guessesCount: 2,
			})
		})

		test('deve atribuir posições corretas com empate no totalPoints', async () => {
			const pollRepository = {
				findById: vi.fn().mockResolvedValue(makePoll({ ownerId: 'owner-1' })),
			}

			const participantRepository = {
				findByUserIdAndPollId: vi.fn().mockResolvedValue(makeParticipant()),
			}

			const rankingRepository = {
				// Alice: exact score (5pts), Bob: exact score (5pts), Carol: wrong (0pts)
				findParticipantsWithGuessesAndResults: vi.fn().mockResolvedValue([
					makeRankingRow({
						participantId: 'p-1',
						userId: 'user-1',
						name: 'Alice',
						guessFirstTeamPoints: 1,
						guessSecondTeamPoints: 0,
						gameFirstTeamGoals: 1,
						gameSecondTeamGoals: 0,
					}),
					makeRankingRow({
						participantId: 'p-2',
						userId: 'user-2',
						name: 'Bob',
						guessFirstTeamPoints: 1,
						guessSecondTeamPoints: 0,
						gameFirstTeamGoals: 1,
						gameSecondTeamGoals: 0,
					}),
					makeRankingRow({
						participantId: 'p-3',
						userId: 'user-3',
						name: 'Carol',
						guessFirstTeamPoints: 0,
						guessSecondTeamPoints: 2,
						gameFirstTeamGoals: 1,
						gameSecondTeamGoals: 0,
					}),
				]),
			}

			const service = new RankingService(
				rankingRepository as any,
				pollRepository as any,
				participantRepository as any,
			)

			const ranking = await service.getRanking('poll-1', 'user-1')

			expect(ranking).toHaveLength(3)

			const alice = ranking.find((r) => r.name === 'Alice')!
			const bob = ranking.find((r) => r.name === 'Bob')!
			const carol = ranking.find((r) => r.name === 'Carol')!

			expect(alice.position).toBe(1)
			expect(alice.totalPoints).toBe(5)
			expect(bob.position).toBe(1)
			expect(bob.totalPoints).toBe(5)
			expect(carol.position).toBe(3)
			expect(carol.totalPoints).toBe(0)
		})

		test('deve ordenar deterministicamente por guessesCount desc e nome asc em caso de empate', async () => {
			const pollRepository = {
				findById: vi.fn().mockResolvedValue(makePoll({ ownerId: 'owner-1' })),
			}

			const participantRepository = {
				findByUserIdAndPollId: vi.fn().mockResolvedValue(makeParticipant()),
			}

			const rankingRepository = {
				// Zara and Bob each have 1 guess with correct winner = 3pts; sorted alphabetically by name
				findParticipantsWithGuessesAndResults: vi.fn().mockResolvedValue([
					// Zara - 1 guess, correct winner = 3pts
					makeRankingRow({
						participantId: 'p-3',
						userId: 'user-3',
						name: 'Zara',
						guessFirstTeamPoints: 2,
						guessSecondTeamPoints: 0,
						gameFirstTeamGoals: 1,
						gameSecondTeamGoals: 0,
					}),
					// Bob - 1 guess, correct winner = 3pts (same as Zara)
					makeRankingRow({
						participantId: 'p-2',
						userId: 'user-2',
						name: 'Bob',
						guessFirstTeamPoints: 2,
						guessSecondTeamPoints: 0,
						gameFirstTeamGoals: 1,
						gameSecondTeamGoals: 0,
					}),
				]),
			}

			const service = new RankingService(
				rankingRepository as any,
				pollRepository as any,
				participantRepository as any,
			)

			const ranking = await service.getRanking('poll-1', 'user-1')

			expect(ranking).toHaveLength(2)
			// Both have same totalPoints and guessesCount, so sorted alphabetically
			expect(ranking[0].name).toBe('Bob')
			expect(ranking[1].name).toBe('Zara')
		})

		test('deve retornar lista vazia quando não há palpites com resultados finalizados', async () => {
			const pollRepository = {
				findById: vi.fn().mockResolvedValue(makePoll({ ownerId: 'owner-1' })),
			}

			const participantRepository = {
				findByUserIdAndPollId: vi.fn().mockResolvedValue(makeParticipant()),
			}

			const rankingRepository = {
				findParticipantsWithGuessesAndResults: vi.fn().mockResolvedValue([]),
			}

			const service = new RankingService(
				rankingRepository as any,
				pollRepository as any,
				participantRepository as any,
			)

			const ranking = await service.getRanking('poll-1', 'user-1')

			expect(ranking).toEqual([])
		})
	})
})
