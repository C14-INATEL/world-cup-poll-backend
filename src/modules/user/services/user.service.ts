import { hashPassword } from '@/core/utils/password'
import { DbExecutor } from '@/infrastructure/db/unit-of-work'
import { UserRepository } from '@/modules/user/repositories/user.repository'

export class UserService {
	constructor(private userRepository: UserRepository) {}

	async createUser(
		data: { email: string; password: string; name: string },
		executor?: DbExecutor,
	) {
		const hashedPassword = await hashPassword(data.password)

		return await this.userRepository.create(
			{
				name: data.name,
				email: data.email,
				passwordHash: hashedPassword,
			},
			executor,
		)
	}

	async findUserByEmail(email: string) {
		return await this.userRepository.findByEmail(email)
	}
}
