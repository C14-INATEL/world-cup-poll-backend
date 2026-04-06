import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import Fastify from 'fastify'
import cron from 'node-cron'
import { env } from '@/config/env'
import { errorHandler } from '@/core/errors/error-handler'
import { responseFormatter } from '@/core/middlewares/response-formatter'
import { getAllMatchesFromApiJob } from '@/infrastructure/jobs/get-games.job'
import { AuthRoutes } from '@/modules/auth/auth.routes'
import { GamesRoutes } from '@/modules/game/game.routes'
import { GuessRoutes } from '@/modules/guess/guess.routes'
import { InviteRoutes } from '@/modules/invite/invite.routes'
import { PollRoutes } from '@/modules/poll/poll.routes'

const buildApp = () => {
	const app = Fastify({
		logger: true,
	})

	app.register(cookie)
	app.register(cors, {
		origin: env.FRONTEND_URL,
		credentials: true,
	})

	app.setErrorHandler(errorHandler)
	app.addHook('onSend', responseFormatter)

	app.decorateRequest('userId', '')

	app.get('/', (_, reply) => {
		return reply.send({ message: 'Hello World' })
	})

	app.register(AuthRoutes, { prefix: '/auth' })
	app.register(InviteRoutes)
	app.register(PollRoutes)
	app.register(GamesRoutes)
	app.register(GuessRoutes)

	cron.schedule('0 0 * * *', async () => {
		await getAllMatchesFromApiJob()
	})

	return app
}

export { buildApp }
