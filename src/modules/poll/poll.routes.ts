import { FastifyInstance } from 'fastify'
import type { AuthMiddleware } from '@/core/middlewares/auth-middleware'
import type { AppDb } from '@/infrastructure/db'
import { PollController } from '@/modules/poll/poll.controller'
import { makePollService } from '@/modules/poll/services/make-poll.service'

export async function PollRoutes(
	app: FastifyInstance,
	{ db, authMiddleware }: { db: AppDb; authMiddleware: AuthMiddleware },
) {
	const pollController = new PollController(makePollService(db))

	app.addHook('preHandler', authMiddleware)

	app.post('/poll/create', pollController.create.bind(pollController))
	app.post('/poll/join', pollController.join.bind(pollController))
	app.get('/poll/:code', pollController.find.bind(pollController))
	app.get('/polls/user', pollController.findAllUserPolls.bind(pollController))
	app.patch('/poll/:id', pollController.update.bind(pollController))
	app.delete('/poll/:id', pollController.delete.bind(pollController))
}
