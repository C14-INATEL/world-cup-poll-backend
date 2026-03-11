import { UserType, UserTypeInsert } from '@/db/schemas'

export interface UserRepositoryInterface {
	create(data: UserTypeInsert): Promise<UserType>
	findByEmail(email: string): Promise<UserType>
	findByEmailAndPassword({
		email,
		password,
	}: {
		email: string
		password: string
	}): Promise<UserType>
}
