import type { AppDb } from '@/infrastructure/db'
import { GameRepository } from '@/modules/game/repositories/game.repository'
import { GameService } from './game.service'

export function makeGameService(db: AppDb) {
	const gameRepository = new GameRepository(db)

	return new GameService(gameRepository)
}
