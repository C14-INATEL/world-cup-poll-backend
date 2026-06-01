import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import Fastify from 'fastify'
import cron from 'node-cron'
import { env } from '@/config/env'
import { errorHandler } from '@/core/errors/error-handler'
import { makeAuthMiddleware } from '@/core/middlewares/auth-middleware'
import { responseFormatter } from '@/core/middlewares/response-formatter'
import type { AppDb } from '@/infrastructure/db'
import { getAllMatchesFromApiJob } from '@/infrastructure/jobs/get-games.job'
import { AuthRoutes } from '@/modules/auth/auth.routes'
import { GamesRoutes } from '@/modules/game/game.routes'
import { GuessRoutes } from '@/modules/guess/guess.routes'
import { InviteRoutes } from '@/modules/invite/invite.routes'
import { PollRoutes } from '@/modules/poll/poll.routes'
import { RankingRoutes } from '@/modules/ranking/ranking.routes'
import { makeSessionService } from '@/modules/session/services/make-session.service'
import { UserRoutes } from '@/modules/user/user.routes'

const buildApp = (db: AppDb) => {
	const sessionService = makeSessionService(db)
	const authMiddleware = makeAuthMiddleware(sessionService)
	const app = Fastify({
		logger: true,
	})

	app.register(cookie)
	app.register(jwt, {
		secret: env.JWT_SECRET,
	})
	app.register(cors, {
		origin:
			env.FRONTEND_URL ??
			((origin, cb) => {
				const hostname = new URL(origin || '').hostname
				if (hostname === 'localhost') {
					cb(null, true)
					return
				}
				cb(new Error('Not allowed'), false)
			}),
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	})

	app.setErrorHandler(errorHandler)
	app.addHook('onSend', responseFormatter)

	app.decorateRequest('userId', '')

	app.get('/', (_, reply) => {
		return reply.send({ message: 'Hello World' })
	})

	app.register(AuthRoutes, { prefix: '/auth', db })
	app.register(UserRoutes, { db, authMiddleware })
	app.register(InviteRoutes, { db, authMiddleware })
	app.register(PollRoutes, { db, authMiddleware })
	app.register(GamesRoutes, { db, authMiddleware })
	app.register(GuessRoutes, { db, authMiddleware })
	app.register(RankingRoutes, { db, authMiddleware })

	cron.schedule('0 0 * * *', async () => {
		await getAllMatchesFromApiJob(db)
	})

	return app
}

export { buildApp }
