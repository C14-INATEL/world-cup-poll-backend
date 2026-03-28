import { makeSessionService } from '@/modules/session/services/make-session.service'
import { makeUserService } from '@/modules/user/services/make-user.service'
import { UnitOfWork } from '@/shared/db/unit-of-work'
import { AuthService } from './auth.service'

export function makeAuthService() {
	const userService = makeUserService()
	const sessionService = makeSessionService()
	const unitOfWork = new UnitOfWork()

	return new AuthService(userService, sessionService, unitOfWork)
}
