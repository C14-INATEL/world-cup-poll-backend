import { and, desc, eq, ne, sql } from 'drizzle-orm'
import type { AppDb } from '@/infrastructure/db'
import {
	gameTable,
	GuessInsert,
	guessTable,
	participantTable,
	pollTable,
	userTable,
} from '@/infrastructure/db/schemas'
import { GuessRepositoryInterface } from './guess.interface'

export class GuessRepository implements GuessRepositoryInterface {
	constructor(private readonly db: AppDb) {}

	async findAll() {
		return this.db.select().from(guessTable)
	}

	findAllByGameId(gameId: string) {
		return this.db.select().from(guessTable).where(eq(guessTable.gameId, gameId))
	}

	async findById(id: string) {
		return this.db
			.select()
			.from(guessTable)
			.where(eq(guessTable.id, id))
			.limit(1)
			.then((res) => res[0] || null)
	}

	async findByParticipantId(participantId: string) {
		return this.db
			.select()
			.from(guessTable)
			.where(eq(guessTable.participantId, participantId))
	}

	async findByParticipantAndGame(gameId: string, participantId: string) {
		return this.db
			.select()
			.from(guessTable)
			.where(
				and(
					eq(guessTable.gameId, gameId),
					eq(guessTable.participantId, participantId),
				),
			)
			.limit(1)
			.then((res) => res[0] || null)
	}

	async findByPollIdWithDetails(pollId: string, excludedUserId: string) {
		return this.db
			.select({
				guessId: guessTable.id,
				guessCreatedAt: guessTable.createdAt,
				guessFirstTeamPoints: guessTable.firstTeamPoints,
				guessSecondTeamPoints: guessTable.secondTeamPoints,
				participantId: participantTable.id,
				participantName: userTable.name,
				pollId: pollTable.id,
				pollTitle: pollTable.title,
				gameId: gameTable.id,
				gameDate: gameTable.date,
				gameFirstTeamName: gameTable.firstTeamName,
				gameSecondTeamName: gameTable.secondTeamName,
				gameFirstTeamCountryCode: gameTable.firstTeamCountryCode,
				gameSecondTeamCountryCode: gameTable.secondTeamCountryCode,
				gameFirstTeamGoals: gameTable.firstTeamGoals,
				gameSecondTeamGoals: gameTable.secondTeamGoals,
			})
			.from(guessTable)
			.innerJoin(participantTable, eq(guessTable.participantId, participantTable.id))
			.innerJoin(userTable, eq(participantTable.userId, userTable.id))
			.innerJoin(pollTable, eq(participantTable.pollId, pollTable.id))
			.innerJoin(gameTable, eq(guessTable.gameId, gameTable.id))
			.where(
				and(
					eq(participantTable.pollId, pollId),
					ne(participantTable.userId, excludedUserId),
				),
			)
			.orderBy(desc(guessTable.createdAt))
	}

	async findByUserIdWithDetails(
		userId: string,
		options: { limit: number; offset: number },
	) {
		const rows = await this.db
			.select({
				guessId: guessTable.id,
				guessCreatedAt: guessTable.createdAt,
				guessFirstTeamPoints: guessTable.firstTeamPoints,
				guessSecondTeamPoints: guessTable.secondTeamPoints,
				pollId: pollTable.id,
				pollTitle: pollTable.title,
				gameId: gameTable.id,
				gameDate: gameTable.date,
				gameFirstTeamName: gameTable.firstTeamName,
				gameSecondTeamName: gameTable.secondTeamName,
				gameFirstTeamCountryCode: gameTable.firstTeamCountryCode,
				gameSecondTeamCountryCode: gameTable.secondTeamCountryCode,
				gameFirstTeamGoals: gameTable.firstTeamGoals,
				gameSecondTeamGoals: gameTable.secondTeamGoals,
			})
			.from(guessTable)
			.innerJoin(participantTable, eq(guessTable.participantId, participantTable.id))
			.innerJoin(pollTable, eq(participantTable.pollId, pollTable.id))
			.innerJoin(gameTable, eq(guessTable.gameId, gameTable.id))
			.where(eq(participantTable.userId, userId))
			.orderBy(desc(guessTable.createdAt))
			.limit(options.limit)
			.offset(options.offset)

		const totalRow = await this.db
			.select({ total: sql<number>`count(*)` })
			.from(guessTable)
			.innerJoin(participantTable, eq(guessTable.participantId, participantTable.id))
			.where(eq(participantTable.userId, userId))
			.then((res) => res[0]?.total ?? 0)

		return { rows, total: Number(totalRow) }
	}

	async create(data: GuessInsert) {
		const [guess] = await this.db.insert(guessTable).values(data).returning()
		return guess
	}

	async update(data: {
		id: string
		guess: {
			firstTeamPoints?: number
			secondTeamPoints?: number
		}
	}) {
		const [guess] = await this.db
			.update(guessTable)
			.set(data.guess)
			.where(eq(guessTable.id, data.id))
			.returning()
		return guess
	}
}
