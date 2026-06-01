import { and, eq } from 'drizzle-orm'
import type { AppDb } from '@/infrastructure/db'
import { UserTypeInsert, userTable } from '@/infrastructure/db/schemas'
import { DbExecutor } from '@/infrastructure/db/unit-of-work'
import { UserRepositoryInterface } from './user.interface'

export class UserRepository implements UserRepositoryInterface {
	constructor(private readonly db: AppDb) {}

	async create(data: UserTypeInsert, executor: DbExecutor = this.db) {
		return executor
			.insert(userTable)
			.values(data)
			.returning({
				id: userTable.id,
				name: userTable.name,
				email: userTable.email,
			})
			.then((res) => res[0])
	}

	async findByEmail(email: string) {
		return this.db
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
		return this.db
			.select({
				id: userTable.id,
				name: userTable.name,
				email: userTable.email,
			})
			.from(userTable)
			.where(and(eq(userTable.email, email), eq(userTable.passwordHash, password)))
			.limit(1)
			.then((res) => res[0])
	}

	async findById(id: string) {
		return this.db
			.select({
				id: userTable.id,
				name: userTable.name,
				email: userTable.email,
			})
			.from(userTable)
			.where(eq(userTable.id, id))
			.limit(1)
			.then((res) => res[0])
	}

	async updateProfile(id: string, data: { name: string; email: string }) {
		return db
			.update(userTable)
			.set(data)
			.where(eq(userTable.id, id))
			.returning({
				id: userTable.id,
				name: userTable.name,
				email: userTable.email,
			})
			.then((res) => res[0] || null)
	}
}
