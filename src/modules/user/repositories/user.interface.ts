import { UserType, UserTypeInsert } from '@/infrastructure/db/schemas'
import { DbExecutor } from '@/infrastructure/db/unit-of-work'

export interface UserRepositoryInterface {
	create(data: UserTypeInsert, executor?: DbExecutor): Promise<UserType>
	findByEmail(email: string): Promise<UserType | null>
	findByEmailAndPassword({
		email,
		password,
	}: {
		email: string
		password: string
	}): Promise<UserType | null>
}
