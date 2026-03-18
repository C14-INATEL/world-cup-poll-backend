import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import Fastify from 'fastify'
import { errorHandler } from '@/errors/error-handler'
import { responseFormatter } from '@/hooks/response-formatter'
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

	return app
}

export { buildServer }
