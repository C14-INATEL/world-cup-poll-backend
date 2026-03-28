import { SessionService } from '@/modules/session/services/session.service'
import { UserService } from '@/modules/user/services/user.service'
import { UnitOfWork } from '@/shared/db/unit-of-work'
import { UnauthorizedError } from '@/shared/errors/error-handler'
import { compareHashPassword } from '@/shared/utils/password'

export class AuthService {
	constructor(
		private userService: UserService,
		private sessionService: SessionService,
		private unitOfWork: UnitOfWork,
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
		return this.unitOfWork.execute(async (trx) => {
			const user = await this.userService.createUser(data, trx)
			const session = await this.sessionService.createSession(user.id, trx)

			return { user, session }
		})
	}

	async logout(sessionId: string) {
		await this.sessionService.deleteSession(sessionId)
	}
}
