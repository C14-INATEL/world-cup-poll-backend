import { FastifyInstance } from 'fastify'
import { authMiddleware } from '@/core/middlewares/auth-middleware'
import { RankingController } from '@/modules/ranking/ranking.controller'
import { makeRankingService } from '@/modules/ranking/services/make-ranking.service'

const rankingController = new RankingController(makeRankingService())

export async function RankingRoutes(app: FastifyInstance) {
	app.addHook('preHandler', authMiddleware)

	app.get('/polls/:pollId/ranking', rankingController.getRanking.bind(rankingController))
}
