import { FastifyReply, FastifyRequest } from 'fastify'
import { UnauthorizedError } from '@/core/errors/error-handler'
import { makeSessionService } from '@/modules/session/services/make-session.service'

const sessionService = makeSessionService()

type AuthTokenPayload = {
	sessionToken?: string
	sub?: string
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
	let payload: AuthTokenPayload

	try {
		payload = await request.jwtVerify<AuthTokenPayload>()
	} catch {
		throw new UnauthorizedError('Usuário não autenticado')
	}

	if (!payload.sessionToken) {
		throw new UnauthorizedError('Usuário não autenticado')
	}

	const session = await sessionService.validateSession(payload.sessionToken)

	if (payload.sub && payload.sub !== session.userId) {
		throw new UnauthorizedError('Usuário não autenticado')
	}

	request.userId = session.userId
}
