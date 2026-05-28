import { buildApp } from '@/app'
import { env } from '@/config/env'
import { createDb } from '@/infrastructure/db'

process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception:', err)
	process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection at:', promise, 'reason:', reason)
	process.exit(1)
})

const { db } = createDb(env.DATABASE_URL)

const fastify = buildApp(db)

fastify
	.listen({ port: env.PORT, host: '0.0.0.0' })
	.then(() => {
		const address = fastify.server.address()
		const url =
			address && typeof address !== 'string'
				? `http://${address.address}:${address.port}`
				: `http://0.0.0.0:${env.PORT}`
		console.log(`Servidor rodando em ${url}`)
	})
	.catch((err) => {
		fastify.log.error(err)
		process.exit(1)
	})
