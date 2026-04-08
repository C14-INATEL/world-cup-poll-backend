import { randomUUID } from 'crypto'
import { isBefore } from 'date-fns'
import { UnauthorizedError } from '@/core/errors/error-handler'
import { DbExecutor } from '@/infrastructure/db/unit-of-work'
import { SessionRepository } from '@/modules/session/repositories/session.repository'

export class SessionService {
	constructor(private sessionRepository: SessionRepository) {}

	async createSession(userId: string, executor?: DbExecutor) {
		const sessionToken = randomUUID()
		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

		return await this.sessionRepository.create(
			{ userId, sessionToken, expiresAt },
			executor,
		)
	}

	async validateSession(sessionToken: string) {
		const session = await this.sessionRepository.findByToken(sessionToken)

		if (!session) {
			throw new UnauthorizedError('Usuário não autenticado')
		}

		if (isBefore(session.expiresAt, new Date())) {
			throw new UnauthorizedError('Sessão expirada')
		}

		return session
	}

	async deleteSession(sessionToken: string, executor?: DbExecutor) {
		await this.sessionRepository.delete(sessionToken, executor)
	}
}
