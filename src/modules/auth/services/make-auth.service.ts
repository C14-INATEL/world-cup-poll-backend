import type { AppDb } from '@/infrastructure/db'
import { UnitOfWork } from '@/infrastructure/db/unit-of-work'
import { makeSessionService } from '@/modules/session/services/make-session.service'
import { makeUserService } from '@/modules/user/services/make-user.service'
import { AuthService } from './auth.service'

export function makeAuthService(db: AppDb) {
	const userService = makeUserService(db)
	const sessionService = makeSessionService(db)
	const unitOfWork = new UnitOfWork(db)

	return new AuthService(userService, sessionService, unitOfWork)
}
