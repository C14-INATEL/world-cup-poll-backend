import { UserRepository } from '@/repositories/user-repository'
import { UserService } from '../user.service'

export function makeUserService() {
	const userRepository = new UserRepository()

	return new UserService(userRepository)
}
