import { FastifyReply, FastifyRequest } from 'fastify'
import { UnauthorizedError } from '@/core/errors/error-handler'
import { SessionService } from '@/modules/session/services/session.service'

type AuthTokenPayload = {
	sessionToken?: string
	sub?: string
}

export type AuthMiddleware = (
	request: FastifyRequest,
	reply: FastifyReply,
) => Promise<void>

export function makeAuthMiddleware(sessionService: SessionService): AuthMiddleware {
	return async function authMiddleware(
		request: FastifyRequest,
		_reply: FastifyReply,
	) {
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
}
