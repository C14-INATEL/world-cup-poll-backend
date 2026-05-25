import { and, eq } from 'drizzle-orm'
import type { AppDb } from '@/infrastructure/db'
import { GuessInsert, guessTable } from '@/infrastructure/db/schemas'
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
