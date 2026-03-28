import { eq } from 'drizzle-orm'
import { db } from '@/shared/db'
import { UserSessionInsert, userSessionsTable } from '@/shared/db/schemas'
import { DbExecutor } from '@/shared/db/unit-of-work'
import { SessionRepositoryInterface } from './session.interface'

export class SessionRepository implements SessionRepositoryInterface {
	async create(
		{ userId, sessionToken, expiresAt }: UserSessionInsert,
		executor: DbExecutor = db,
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
		return db
			.select()
			.from(userSessionsTable)
			.where(eq(userSessionsTable.sessionToken, sessionToken))
			.limit(1)
			.then((res) => res[0])
	}

	async delete(tokenId: string, executor: DbExecutor = db) {
		await executor
			.delete(userSessionsTable)
			.where(eq(userSessionsTable.sessionToken, tokenId))
	}
}
