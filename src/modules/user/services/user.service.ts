import { NotFoundError } from '@/core/errors/error-handler'
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

	async findUserById(id: string) {
		return await this.userRepository.findById(id)
	}

	async updateProfile(id: string, data: { name: string; email: string }) {
		const user = await this.userRepository.updateProfile(id, data)

		if (!user) {
			throw new NotFoundError('Usuario nao encontrado')
		}

		return user
	}
}
