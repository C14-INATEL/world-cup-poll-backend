import { FastifyInstance } from 'fastify'
import { AuthController } from '@/modules/auth/auth.controller'
import { makeAuthService } from '@/modules/auth/services/make-auth.service'

const authService = makeAuthService()
const authController = new AuthController(authService)

export async function AuthRoutes(app: FastifyInstance) {
	app.post('/register', authController.register.bind(authController))
	app.post('/login', authController.login.bind(authController))
	app.post('/logout', authController.logout.bind(authController))
}
