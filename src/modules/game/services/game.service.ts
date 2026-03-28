import { GameRepository } from '@/modules/game/repositories/game.repository'
import { GameInsert } from '@/shared/db/schemas'

export class GameService {
	constructor(private gameRepository: GameRepository) {}

	async upsertGame({ apiId, game }: { apiId?: number; game: GameInsert }) {
		const existingGame = apiId ? await this.gameRepository.findByApiId(apiId) : null

		if (existingGame && apiId) {
			return await this.gameRepository.updateByApiId({ apiId, game })
		}

		return await this.gameRepository.create(game)
	}

	async getAllGames() {
		return await this.gameRepository.findAll()
	}
}
