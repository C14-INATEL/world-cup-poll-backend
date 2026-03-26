import { GameRepository } from '@/repositories/game-repository'
import { GameService } from '../game.service'

export function makeGameService() {
	const gameRepository = new GameRepository()

	return new GameService(gameRepository)
}
