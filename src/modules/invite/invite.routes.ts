import { FastifyInstance } from 'fastify'
import type { AuthMiddleware } from '@/core/middlewares/auth-middleware'
import type { AppDb } from '@/infrastructure/db'
import { InviteController } from '@/modules/invite/invite.controller'
import { makeInviteService } from '@/modules/invite/services/make-invite.service'

export async function InviteRoutes(
	app: FastifyInstance,
	{ db, authMiddleware }: { db: AppDb; authMiddleware: AuthMiddleware },
) {
	const inviteController = new InviteController(makeInviteService(db))

	app.addHook('preHandler', authMiddleware)

	app.post('/poll/invite', inviteController.create.bind(inviteController))
	app.get('/me/invites', inviteController.findUserInvites.bind(inviteController))
	app.patch(
		'/invite/:id',
		inviteController.changeInviteStatus.bind(inviteController),
	)
}
