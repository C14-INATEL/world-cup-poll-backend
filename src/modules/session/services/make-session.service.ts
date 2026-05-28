import type { AppDb } from '@/infrastructure/db'
import { SessionRepository } from '@/modules/session/repositories/session.repository'
import { SessionService } from './session.service'

export function makeSessionService(db: AppDb) {
	const sessionRepository = new SessionRepository(db)

	return new SessionService(sessionRepository)
}
