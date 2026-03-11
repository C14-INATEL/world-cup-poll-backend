import { integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { gameTable } from './game'

export const guessTable = pgTable('guess', {
	id: uuid().primaryKey().defaultRandom(),
	firstTeamPoints: integer().notNull(),
	secondTeamPoints: integer().notNull(),
	createdAt: timestamp().defaultNow().notNull(),
	gameId: uuid()
		.notNull()
		.references(() => gameTable.id),
	participantId: uuid().notNull(),
})
