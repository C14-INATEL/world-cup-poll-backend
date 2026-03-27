import { integer, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { gameTable } from './game'
import { participantTable } from './participant'

export const guessTable = pgTable(
	'guess',
	{
		id: uuid().primaryKey().defaultRandom(),
		firstTeamPoints: integer().notNull(),
		secondTeamPoints: integer().notNull(),
		createdAt: timestamp().defaultNow().notNull(),
		gameId: uuid()
			.notNull()
			.references(() => gameTable.id),
		participantId: uuid()
			.notNull()
			.references(() => participantTable.id),
	},
	(t) => [unique().on(t.participantId, t.gameId)],
)

export type Guess = typeof guessTable.$inferSelect
export type GuessInsert = typeof guessTable.$inferInsert
