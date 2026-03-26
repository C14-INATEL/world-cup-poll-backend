import { DbExecutor } from '@/db/unit-of-work'
import { UserRepository } from '@/repositories/user-repository'
import { hashPassword } from '@/utils/password'

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
