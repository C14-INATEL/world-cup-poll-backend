import { FastifyInstance } from 'fastify'
import { PollController } from '@/controllers/poll-controller'
import { authMiddleware } from '@/middlewares/auth-middleware'
import { makePollService } from '@/services/factories/make-poll-service'

const pollService = makePollService()
const pollController = new PollController(pollService)

export async function PollRoutes(app: FastifyInstance) {
	app.addHook('preHandler', authMiddleware)

	app.post('/poll/create', pollController.create.bind(pollController))
	app.get('/poll/:code', pollController.find.bind(pollController))
	app.get('/polls/user', pollController.findAllUserPolls.bind(pollController))
}
