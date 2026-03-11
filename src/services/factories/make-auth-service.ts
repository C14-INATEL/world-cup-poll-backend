import { AuthService } from '../auth.service'
import { makeSessionService } from './make-session-service'
import { makeUserService } from './make-user-service'

export function makeAuthService() {
	const userService = makeUserService()
	const sessionService = makeSessionService()

	return new AuthService(userService, sessionService)
}
