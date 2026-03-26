import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import Fastify from 'fastify'
import cron from 'node-cron'
import { errorHandler } from '@/errors/error-handler'
import { responseFormatter } from '@/hooks/response-formatter'
import { getAllMatchesFromApiJob } from '@/jobs/get-games.job'
import { AuthRoutes } from '@/routes/auth-route'
import { InviteRoutes } from '@/routes/invite-route'
import { PollRoutes } from '@/routes/poll-route'
import { env } from './env'

const buildServer = () => {
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

	app.register(PollRoutes)
	app.register(InviteRoutes)
	app.register(AuthRoutes, { prefix: '/auth' })

	cron.schedule('0 0 * * *', async () => {
		await getAllMatchesFromApiJob()
	})

	return app
}

export { buildServer }
