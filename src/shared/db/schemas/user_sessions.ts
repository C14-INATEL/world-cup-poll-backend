import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { userTable } from './user'

export const userSessionsTable = pgTable('user_sessions', {
	id: uuid().primaryKey().defaultRandom(),
	sessionToken: uuid().notNull(),
	expiresAt: timestamp({ withTimezone: true }).notNull(),
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
	userId: uuid()
		.notNull()
		.references(() => userTable.id),
})

export type UserSession = typeof userSessionsTable.$inferSelect
export type UserSessionInsert = typeof userSessionsTable.$inferInsert
