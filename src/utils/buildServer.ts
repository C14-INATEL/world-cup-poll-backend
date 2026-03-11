import cookie from '@fastify/cookie'
import Fastify from 'fastify'
import { errorHandler } from '@/errors/error-handler'
import { responseFormatter } from '@/hooks/response-formatter'
import { AuthRoutes } from '@/routes/auth-route'

const buildServer = () => {
	const app = Fastify({
		logger: true,
	})

	app.register(cookie)

	app.setErrorHandler(errorHandler)
	app.addHook('onSend', responseFormatter)

	app.get('/', (_, reply) => {
		return reply.send({ message: 'Hello World' })
	})

	app.register(AuthRoutes)

	return app
}

export { buildServer }
