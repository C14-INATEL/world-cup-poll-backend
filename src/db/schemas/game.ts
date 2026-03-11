import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const gameTable = pgTable('game', {
	id: uuid().primaryKey().defaultRandom(),
	date: timestamp().notNull(),
	firstTeamCountryCode: varchar().notNull(),
	secondTeamCountryCode: varchar().notNull(),
})
