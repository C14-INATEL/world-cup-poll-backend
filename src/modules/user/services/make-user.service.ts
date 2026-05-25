import type { AppDb } from '@/infrastructure/db'
import { UserRepository } from '@/modules/user/repositories/user.repository'
import { UserService } from './user.service'

export function makeUserService(db: AppDb) {
	const userRepository = new UserRepository(db)

	return new UserService(userRepository)
}
