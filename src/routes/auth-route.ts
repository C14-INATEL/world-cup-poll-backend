import { FastifyInstance } from 'fastify'
import { AuthController } from '@/controllers/auth-controller'
import { makeAuthService } from '@/services/factories/make-auth-service'

const authService = makeAuthService()
const authController = new AuthController(authService)

export async function AuthRoutes(app: FastifyInstance) {
	app.post('/register', authController.register.bind(authController))
	app.post('/login', authController.login.bind(authController))
	app.post('/logout', authController.logout.bind(authController))
}
