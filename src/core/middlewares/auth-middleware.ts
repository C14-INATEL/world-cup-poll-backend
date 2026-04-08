import { FastifyReply, FastifyRequest } from 'fastify'
import { UnauthorizedError } from '@/core/errors/error-handler'
import { makeSessionService } from '@/modules/session/services/make-session.service'

const sessionService = makeSessionService()

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
	const sessionId = request.cookies.session_id

	if (!sessionId) {
		throw new UnauthorizedError('Usuário não autenticado')
	}

	const session = await sessionService.validateSession(sessionId)

	request.userId = session.userId
}
