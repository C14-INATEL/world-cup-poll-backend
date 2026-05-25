import { FastifyInstance } from 'fastify'
import type { AuthMiddleware } from '@/core/middlewares/auth-middleware'
import type { AppDb } from '@/infrastructure/db'
import { RankingController } from '@/modules/ranking/ranking.controller'
import { makeRankingService } from '@/modules/ranking/services/make-ranking.service'

export async function RankingRoutes(
	app: FastifyInstance,
	{ db, authMiddleware }: { db: AppDb; authMiddleware: AuthMiddleware },
) {
	const rankingController = new RankingController(makeRankingService(db))

	app.addHook('preHandler', authMiddleware)

	app.get(
		'/polls/:pollId/ranking',
		rankingController.getRanking.bind(rankingController),
	)
}
