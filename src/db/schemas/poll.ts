import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { userTable } from './user'

export const pollTable = pgTable('poll', {
	id: uuid().primaryKey().defaultRandom(),
	title: varchar({ length: 127 }).notNull(),
	code: varchar({ length: 10 }).notNull(),
	createdAt: timestamp('createdAt').defaultNow().notNull(),
	ownerId: uuid()
		.notNull()
		.references(() => userTable.id),
})
