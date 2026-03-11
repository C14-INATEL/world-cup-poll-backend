import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { UserSessionInsert, userSessionsTable } from '@/db/schemas/user_sessions'
import { SessionRepositoryInterface } from './interfaces/session-interface'

export class SessionRepository implements SessionRepositoryInterface {
	async create({ userId, sessionToken, expiresAt }: UserSessionInsert) {
		return db
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

	async delete(id: string) {
		return db.delete(userSessionsTable).where(eq(userSessionsTable.id, id))
	}
}
