import cookie from '@fastify/cookie'
import Fastify from 'fastify'
import { errorHandler } from '@/errors/error-handler'
import { responseFormatter } from '@/hooks/response-formatter'
import { AuthRoutes } from '@/routes/auth-route'
import { InviteRoutes } from '@/routes/invite-route'
import { PollRoutes } from '@/routes/poll-route'

const buildServer = () => {
	const app = Fastify({
		logger: true,
	})

	app.register(cookie)

	app.setErrorHandler(errorHandler)
	app.addHook('onSend', responseFormatter)

	app.decorateRequest('userId', '')

	app.get('/', (_, reply) => {
		return reply.send({ message: 'Hello World' })
	})

	app.register(AuthRoutes)
	app.register(PollRoutes)
	app.register(InviteRoutes)

	return app
}

export { buildServer }
