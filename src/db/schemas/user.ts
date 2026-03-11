import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core'

export const userTable = pgTable('user', {
	id: uuid().primaryKey().defaultRandom(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
	passwordHash: varchar({ length: 255 }).notNull(),
})

export type InsertUserType = typeof userTable.$inferInsert
