import Fastify from 'fastify'
import { errorHandler } from '@/errors/error-handler'
import { responseFormatter } from '@/hooks/response-formatter'

const buildServer = () => {
  const app = Fastify({
    logger: true,
  })

  app.setErrorHandler(errorHandler)
  app.addHook('onSend', responseFormatter)

  app.get('/', (_, reply) => {
    return reply.send({ message: 'Hello World' })
  })

  return app
}

export { buildServer }
