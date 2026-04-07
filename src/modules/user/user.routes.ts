import { FastifyInstance } from 'fastify'
import { authMiddleware } from '@/core/middlewares/auth-middleware'
import { makeUserService } from './services/make-user.service'
import { UserController } from './user.controller'

const userService = makeUserService()
const userController = new UserController(userService)

export async function UserRoutes(app: FastifyInstance) {
	app.addHook('preHandler', authMiddleware)

	app.get('/me', userController.getProfile.bind(userController))
}
