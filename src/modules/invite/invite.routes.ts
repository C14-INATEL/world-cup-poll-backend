import { FastifyInstance } from 'fastify'
import { InviteController } from '@/modules/invite/invite.controller'
import { makeInviteService } from '@/modules/invite/services/make-invite.service'
import { authMiddleware } from '@/shared/middlewares/auth-middleware'

const inviteService = makeInviteService()
const inviteController = new InviteController(inviteService)

export async function InviteRoutes(app: FastifyInstance) {
	app.addHook('preHandler', authMiddleware)

	app.post('/poll/invite', inviteController.create.bind(inviteController))
	app.get('/me/invites', inviteController.findUserInvites.bind(inviteController))
	app.patch(
		'/invite/:id',
		inviteController.changeInviteStatus.bind(inviteController),
	)
}
