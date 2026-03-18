import { randomUUID } from 'crypto'
import { UnauthorizedError } from '@/errors/error-handler'
import { SessionRepository } from '@/repositories/session-repository'

export class SessionService {
	constructor(private sessionRepository: SessionRepository) {}

	async createSession(userId: string) {
		const sessionToken = randomUUID()
		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

		return await this.sessionRepository.create({ userId, sessionToken, expiresAt })
	}

	async validateSession(sessionToken: string) {
		const session = await this.sessionRepository.findByToken(sessionToken)

		if (!session) {
			throw new UnauthorizedError('Session not found')
		}

		if (session.expiresAt < new Date()) {
			throw new UnauthorizedError('Session expired')
		}

		return session
	}

	async deleteSession(sessionToken: string) {
		await this.sessionRepository.delete(sessionToken)
	}
}
