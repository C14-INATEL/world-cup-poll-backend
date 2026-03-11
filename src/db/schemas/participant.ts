import { pgTable, uuid } from 'drizzle-orm/pg-core'
import { pollTable } from './poll'
import { userTable } from './user'

export const participantTable = pgTable('participant', {
	id: uuid().primaryKey().defaultRandom(),
	pollId: uuid()
		.notNull()
		.references(() => pollTable.id),
	userId: uuid()
		.notNull()
		.references(() => userTable.id),
})
