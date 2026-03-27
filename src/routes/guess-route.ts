import { FastifyInstance } from 'fastify'
import { GuessController } from '@/controllers/guess-controller'
import { authMiddleware } from '@/middlewares/auth-middleware'
import { makeGuessService } from '@/services/factories/make-guess-service'

const guessController = new GuessController(makeGuessService())

export async function GuessRoutes(app: FastifyInstance) {
	app.addHook('preHandler', authMiddleware)

	app.post(
		'/polls/:pollId/guess/create',
		guessController.create.bind(guessController),
	)
	app.put(
		'/polls/:pollId/guess/:guessId/update',
		guessController.update.bind(guessController),
	)
	app.get(
		'/guess/participant/:participantId',
		guessController.findByParticipantId.bind(guessController),
	)
	app.get('/guess/game/:gameId', guessController.findByGameId.bind(guessController))
}
