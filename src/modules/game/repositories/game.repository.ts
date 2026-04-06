import { eq } from 'drizzle-orm'
import { db } from '@/infrastructure/db'
import { GameInsert, gameTable } from '@/infrastructure/db/schemas'
import { GameRepositoryInterface } from './game.interface'

export class GameRepository implements GameRepositoryInterface {
	async create(data: GameInsert) {
		return db
			.insert(gameTable)
			.values(data)
			.returning()
			.then((res) => res[0])
	}

	async findAll() {
		return db.select().from(gameTable)
	}

	async findById(id: string) {
		return db
			.select()
			.from(gameTable)
			.where(eq(gameTable.id, id))
			.then((res) => res[0] ?? null)
	}

	async findByApiId(apiId: number) {
		return db
			.select()
			.from(gameTable)
			.where(eq(gameTable.apiId, apiId))
			.then((res) => res[0] ?? null)
	}

	async updateByApiId(data: { apiId: number; game: Partial<GameInsert> }) {
		return db
			.update(gameTable)
			.set(data.game)
			.where(eq(gameTable.apiId, data.apiId))
			.returning()
			.then((res) => res[0])
	}

	async update(data: { id: string; game: Partial<GameInsert> }) {
		return db
			.update(gameTable)
			.set(data.game)
			.where(eq(gameTable.id, data.id))
			.returning()
			.then((res) => res[0])
	}
}
