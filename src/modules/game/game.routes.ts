import { FastifyInstance } from 'fastify'
import { authMiddleware } from '@/core/middlewares/auth-middleware'
import { GameController } from '@/modules/game/game.controller'
import { makeGameService } from '@/modules/game/services/make-game.service'

const gameService = makeGameService()
const gameController = new GameController(gameService)

export async function GamesRoutes(app: FastifyInstance) {
	app.addHook('preHandler', authMiddleware)

	app.get('/games', gameController.findAllGames.bind(gameController))
}
