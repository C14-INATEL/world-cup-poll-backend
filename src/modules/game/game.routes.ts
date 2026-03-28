import { FastifyInstance } from 'fastify'
import { GameController } from '@/modules/game/game.controller'
import { makeGameService } from '@/modules/game/services/make-game.service'
import { authMiddleware } from '@/shared/middlewares/auth-middleware'

const gameService = makeGameService()
const gameController = new GameController(gameService)

export async function GamesRoutes(app: FastifyInstance) {
	app.addHook('preHandler', authMiddleware)

	app.get('/games', gameController.findAllGames.bind(gameController))
}
