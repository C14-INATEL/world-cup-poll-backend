import { FastifyInstance } from 'fastify'
import type { AuthMiddleware } from '@/core/middlewares/auth-middleware'
import type { AppDb } from '@/infrastructure/db'
import { GuessController } from '@/modules/guess/guess.controller'
import { makeGuessService } from '@/modules/guess/services/make-guess.service'

export async function GuessRoutes(
	app: FastifyInstance,
	{ db, authMiddleware }: { db: AppDb; authMiddleware: AuthMiddleware },
) {
	const guessController = new GuessController(makeGuessService(db))

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
	app.get('/guess/user', guessController.findByUser.bind(guessController))
	app.get('/guess/game/:gameId', guessController.findByGameId.bind(guessController))
	app.get(
		'/polls/:pollId/guesses',
		guessController.findByPollId.bind(guessController),
	)
}
