import { FastifyInstance } from 'fastify'
import type { AppDb } from '@/infrastructure/db'
import { AuthController } from '@/modules/auth/auth.controller'
import { makeAuthService } from '@/modules/auth/services/make-auth.service'

export async function AuthRoutes(app: FastifyInstance, { db }: { db: AppDb }) {
	const authController = new AuthController(makeAuthService(db))

	app.post('/register', authController.register.bind(authController))
	app.post('/login', authController.login.bind(authController))
	app.post('/logout', authController.logout.bind(authController))
}
