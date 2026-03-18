import { pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { pollTable } from './poll'
import { userTable } from './user'

export const inviteStatusEnum = pgEnum('inviteStatus', [
	'pending',
	'accepted',
	'declined',
])

export const inviteTable = pgTable('invite', {
	id: uuid().primaryKey().defaultRandom(),
	pollId: uuid()
		.notNull()
		.references(() => pollTable.id),
	invitedUserId: uuid()
		.notNull()
		.references(() => userTable.id),
	invitedBy: uuid()
		.notNull()
		.references(() => userTable.id),
	status: inviteStatusEnum().notNull().default('pending'),
	expiresAt: timestamp().notNull(),
	createdAt: timestamp().notNull().defaultNow(),
})

export type Invite = typeof inviteTable.$inferSelect
export type InviteInsert = typeof inviteTable.$inferInsert

export type InviteStatus = 'pending' | 'accepted' | 'declined'
