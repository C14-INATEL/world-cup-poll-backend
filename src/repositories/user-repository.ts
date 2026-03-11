import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { UserTypeInsert, userTable } from '@/db/schemas'
import { UserRepositoryInterface } from './interfaces/user-interface'

export class UserRepository implements UserRepositoryInterface {
	async create(data: UserTypeInsert) {
		return db
			.insert(userTable)
			.values(data)
			.returning()
			.then((res) => res[0])
	}

	async findByEmail(email: string) {
		return db
			.select()
			.from(userTable)
			.where(eq(userTable.email, email))
			.limit(1)
			.then((res) => res[0])
	}

	async findByEmailAndPassword({
		email,
		password,
	}: {
		email: string
		password: string
	}) {
		return db
			.select()
			.from(userTable)
			.where(and(eq(userTable.email, email), eq(userTable.passwordHash, password)))
			.limit(1)
			.then((res) => res[0])
	}
}
