import { FastifyInstance } from 'fastify'
import { PollController } from '@/modules/poll/poll.controller'
import { makePollService } from '@/modules/poll/services/make-poll.service'
import { authMiddleware } from '@/shared/middlewares/auth-middleware'

const pollService = makePollService()
const pollController = new PollController(pollService)

export async function PollRoutes(app: FastifyInstance) {
	app.addHook('preHandler', authMiddleware)

	app.post('/poll/create', pollController.create.bind(pollController))
	app.get('/poll/:code', pollController.find.bind(pollController))
	app.get('/polls/user', pollController.findAllUserPolls.bind(pollController))
}
