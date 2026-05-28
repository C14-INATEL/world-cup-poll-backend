import { eq } from 'drizzle-orm'
import type { AppDb } from '@/infrastructure/db'
import { UserSessionInsert, userSessionsTable } from '@/infrastructure/db/schemas'
import { DbExecutor } from '@/infrastructure/db/unit-of-work'
import { SessionRepositoryInterface } from './session.interface'

export class SessionRepository implements SessionRepositoryInterface {
	constructor(private readonly db: AppDb) {}

	async create(
		{ userId, sessionToken, expiresAt }: UserSessionInsert,
		executor: DbExecutor = this.db,
	) {
		return executor
			.insert(userSessionsTable)
			.values({
				userId,
				sessionToken,
				expiresAt,
			})
			.returning()
			.then((res) => res[0])
	}

	async findByToken(sessionToken: string) {
		return this.db
			.select()
			.from(userSessionsTable)
			.where(eq(userSessionsTable.sessionToken, sessionToken))
			.limit(1)
			.then((res) => res[0])
	}

	async delete(tokenId: string, executor: DbExecutor = this.db) {
		await executor
			.delete(userSessionsTable)
			.where(eq(userSessionsTable.sessionToken, tokenId))
	}
}
