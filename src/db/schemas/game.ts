import {
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core'

export const gameTable = pgTable('game', {
	id: uuid().primaryKey().defaultRandom(),
	apiId: integer().notNull().unique(),
	date: timestamp({ withTimezone: true }).notNull(),
	status: text().notNull(),
	firstTeamCountryCode: varchar().notNull(),
	secondTeamCountryCode: varchar().notNull(),
	firstTeamName: text(),
	secondTeamName: text(),
	firstTeamGoals: integer(),
	secondTeamGoals: integer(),
	firstTeamCrestUrl: text(),
	secondTeamCrestUrl: text(),
})

export type Game = typeof gameTable.$inferSelect
export type GameInsert = typeof gameTable.$inferInsert
