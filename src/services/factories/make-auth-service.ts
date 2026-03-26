import { UnitOfWork } from '@/db/unit-of-work'
import { AuthService } from '../auth.service'
import { makeSessionService } from './make-session-service'
import { makeUserService } from './make-user-service'

export function makeAuthService() {
	const userService = makeUserService()
	const sessionService = makeSessionService()
	const unitOfWork = new UnitOfWork()

	return new AuthService(userService, sessionService, unitOfWork)
}
