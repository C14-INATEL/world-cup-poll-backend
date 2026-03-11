import { FastifyReply, FastifyRequest } from 'fastify'
import { makeSessionService } from '@/services/factories/make-session-service'

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
	const sessionId = request.cookies.session_id

	if (!sessionId) {
		return reply.status(401).send({
			message: 'Não autenticado',
		})
	}

	const sessionService = makeSessionService()

	const session = await sessionService.validateSession(sessionId)

	request.userId = session.userId
}
