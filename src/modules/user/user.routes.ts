import { FastifyInstance } from 'fastify'
import type { AuthMiddleware } from '@/core/middlewares/auth-middleware'
import type { AppDb } from '@/infrastructure/db'
import { makeUserService } from './services/make-user.service'
import { UserController } from './user.controller'

export async function UserRoutes(
	app: FastifyInstance,
	{ db, authMiddleware }: { db: AppDb; authMiddleware: AuthMiddleware },
) {
	const userController = new UserController(makeUserService(db))

	app.addHook('preHandler', authMiddleware)

	app.get('/me', userController.getProfile.bind(userController))
	app.get('/users/search', userController.search.bind(userController))
	app.patch('/me', userController.updateProfile.bind(userController))
}
