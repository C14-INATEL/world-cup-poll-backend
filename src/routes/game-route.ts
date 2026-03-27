import { FastifyInstance } from 'fastify'
import { GameController } from '@/controllers/game-controller'
import { authMiddleware } from '@/middlewares/auth-middleware'
import { makeGameService } from '@/services/factories/make-game-service'

const gameService = makeGameService()
const gameController = new GameController(gameService)

export async function GamesRoutes(app: FastifyInstance) {
	app.addHook('preHandler', authMiddleware)

	app.get('/games', gameController.findAllGames.bind(gameController))
}
