import { FastifyInstance } from 'fastify'
import { AuthController } from '@/controllers/auth-controller'
import { authMiddleware } from '@/middlewares/auth-middleware'
import { makeAuthService } from '@/services/factories/make-auth-service'
import { makeUserService } from '@/services/factories/make-user-service'

const authService = makeAuthService()
const userService = makeUserService()
const authController = new AuthController(authService, userService)

export async function AuthRoutes(app: FastifyInstance) {
	app.post('/register', authController.register.bind(authController))
	app.post('/login', authController.login.bind(authController))
	app.get(
		'/me',
		{ preHandler: [authMiddleware] },
		authController.me.bind(authController),
	)
	app.post('/logout', authController.logout.bind(authController))
}
