import { UnauthorizedError } from '@/errors/error-handler'
import { compareHashPassword } from '@/utils/password'
import { SessionService } from './session.service'
import { UserService } from './user.service'

export class AuthService {
	constructor(
		private userService: UserService,
		private sessionService: SessionService,
	) {}

	async login(data: { email: string; password: string }) {
		const user = await this.userService.findUserByEmail(data.email)

		if (!user) {
			throw new UnauthorizedError('Email ou senha incorretos')
		}

		const isPasswordValid = await compareHashPassword(
			data.password,
			user.passwordHash,
		)

		if (!isPasswordValid) {
			throw new UnauthorizedError('Email ou senha incorretos')
		}

		const session = await this.sessionService.createSession(user.id)

		return { user, session }
	}

	async register(data: { email: string; password: string; name: string }) {
		const user = await this.userService.createUser(data)

		const session = await this.sessionService.createSession(user.id)

		return { user, session }
	}
}
