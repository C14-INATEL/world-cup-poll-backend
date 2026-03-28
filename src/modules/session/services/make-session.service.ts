import { SessionRepository } from '@/modules/session/repositories/session.repository'
import { SessionService } from './session.service'

export function makeSessionService() {
	const sessionRepository = new SessionRepository()

	return new SessionService(sessionRepository)
}
