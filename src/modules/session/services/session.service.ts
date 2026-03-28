import { randomUUID } from 'crypto'
import { isBefore } from 'date-fns'
import { SessionRepository } from '@/modules/session/repositories/session.repository'
import { DbExecutor } from '@/shared/db/unit-of-work'
import { UnauthorizedError } from '@/shared/errors/error-handler'

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
			throw new UnauthorizedError('Session not found')
		}

		if (isBefore(session.expiresAt, new Date())) {
			throw new UnauthorizedError('Session expired')
		}

		return session
	}

	async deleteSession(sessionToken: string, executor?: DbExecutor) {
		await this.sessionRepository.delete(sessionToken, executor)
	}
}
