import { beforeEach, describe, expect, test, vi } from 'vitest'
import { GameService } from '@/modules/game/services/game.service'
import { makeGame } from '../factories/game/make-game'

function makeGamePayload(overrides = {}) {
	return {
		apiId: 42,
		date: '2026-06-12T19:00:00.000Z',
		status: 'SCHEDULED',
		firstTeamCountryCode: 'BRA',
		secondTeamCountryCode: 'ARG',
		firstTeamName: 'Brasil',
		secondTeamName: 'Argentina',
		firstTeamGoals: null,
		secondTeamGoals: null,
		firstTeamCrestUrl: null,
		secondTeamCrestUrl: null,
		...overrides,
	}
}

describe('GameService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('upsertGame', () => {
		test('deve atualizar a partida quando ja existe jogo com o mesmo apiId', async () => {
			const gamePayload = makeGamePayload({
				status: 'FINISHED',
				firstTeamGoals: 2,
				secondTeamGoals: 1,
			})
			const updatedGame = makeGame({
				apiId: 42,
				status: 'FINISHED',
				firstTeamGoals: 2,
				secondTeamGoals: 1,
			})

			const gameRepository = {
				findByApiId: vi.fn().mockResolvedValue(makeGame({ apiId: 42 })),
				updateByApiId: vi.fn().mockResolvedValue(updatedGame),
				create: vi.fn(),
			}

			const service = new GameService(gameRepository as any)

			const result = await service.upsertGame({
				apiId: 42,
				game: gamePayload as any,
			})

			expect(gameRepository.findByApiId).toHaveBeenCalledWith(42)
			expect(gameRepository.updateByApiId).toHaveBeenCalledWith({
				apiId: 42,
				game: gamePayload,
			})
			expect(gameRepository.create).not.toHaveBeenCalled()
			expect(result).toEqual(updatedGame)
		})

		test('deve criar a partida quando nao existe jogo com o apiId informado', async () => {
			const gamePayload = makeGamePayload({ apiId: 99 })
			const createdGame = makeGame({ apiId: 99 })

			const gameRepository = {
				findByApiId: vi.fn().mockResolvedValue(null),
				updateByApiId: vi.fn(),
				create: vi.fn().mockResolvedValue(createdGame),
			}

			const service = new GameService(gameRepository as any)

			const result = await service.upsertGame({
				apiId: 99,
				game: gamePayload as any,
			})

			expect(gameRepository.findByApiId).toHaveBeenCalledWith(99)
			expect(gameRepository.create).toHaveBeenCalledWith(gamePayload)
			expect(gameRepository.updateByApiId).not.toHaveBeenCalled()
			expect(result).toEqual(createdGame)
		})
	})
})
