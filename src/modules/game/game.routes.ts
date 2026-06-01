import { FastifyInstance } from 'fastify'
import type { AuthMiddleware } from '@/core/middlewares/auth-middleware'
import type { AppDb } from '@/infrastructure/db'
import { GameController } from '@/modules/game/game.controller'
import { makeGameService } from '@/modules/game/services/make-game.service'

export async function GamesRoutes(
	app: FastifyInstance,
	{ db, authMiddleware }: { db: AppDb; authMiddleware: AuthMiddleware },
) {
	const gameController = new GameController(makeGameService(db))

	app.addHook('preHandler', authMiddleware)

	app.get('/games', gameController.findAllGames.bind(gameController))
}
