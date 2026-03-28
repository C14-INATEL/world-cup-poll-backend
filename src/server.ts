import { buildApp } from '@/app'
import { env } from '@/config'

process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception:', err)
	process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection at:', promise, 'reason:', reason)
	process.exit(1)
})

const fastify = buildApp()

fastify
	.listen({ port: env.PORT })
	.then(() => {
		console.log(`Servidor rodando em http://localhost:${env.PORT}`)
	})
	.catch((err) => {
		fastify.log.error(err)
		process.exit(1)
	})
