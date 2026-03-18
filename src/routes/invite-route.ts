import { FastifyInstance } from 'fastify'
import { InviteController } from '@/controllers/invite-controller'
import { authMiddleware } from '@/middlewares/auth-middleware'
import { makeInviteService } from '@/services/factories/make-invite-service'

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
