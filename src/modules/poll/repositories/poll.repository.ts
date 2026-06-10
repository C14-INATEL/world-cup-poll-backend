import { and, count, eq, exists, isNotNull, or, sql } from 'drizzle-orm'
import type { AppDb } from '@/infrastructure/db'
import {
	guessTable,
	inviteTable,
	PollInsert,
	participantTable,
	pollTable,
	userTable,
} from '@/infrastructure/db/schemas'
import { PollRepositoryInterface } from './poll.interface'

export class PollRepository implements PollRepositoryInterface {
	constructor(private readonly db: AppDb) {}

	async create(data: PollInsert) {
		return this.db
			.insert(pollTable)
			.values(data)
			.returning()
			.then((res) => res[0])
	}

	async findById(id: string) {
		return this.db
			.select()
			.from(pollTable)
			.where(eq(pollTable.id, id))
			.then((res) => res[0] || null)
	}

	async findByCode(code: string) {
		return this.db
			.select()
			.from(pollTable)
			.where(eq(pollTable.code, code))
			.then((res) => res[0] || null)
	}

	async findByCodeAndUserId(code: string, userId: string) {
		return this.db
			.select({
				id: pollTable.id,
				title: pollTable.title,
				code: pollTable.code,
				createdAt: pollTable.createdAt,
				ownerId: pollTable.ownerId,
				ownerName: userTable.name,
			})
			.from(pollTable)
			.innerJoin(userTable, eq(pollTable.ownerId, userTable.id))
			.leftJoin(participantTable, eq(participantTable.pollId, pollTable.id))
			.where(
				and(
					eq(pollTable.code, code),
					or(
						eq(pollTable.ownerId, userId),
						exists(
							this.db
								.select()
								.from(participantTable)
								.where(
									and(
										eq(participantTable.pollId, pollTable.id),
										eq(participantTable.userId, userId),
									),
								),
						),
					),
				),
			)
			.groupBy(pollTable.id, userTable.name)
			.then((res) => res[0] || null)
	}

	async updateTitle(id: string, title: string) {
		return this.db
			.update(pollTable)
			.set({ title })
			.where(eq(pollTable.id, id))
			.returning()
			.then((res) => res[0])
	}

	async delete(id: string) {
		return this.db.transaction(async (trx) => {
			await trx.delete(inviteTable).where(eq(inviteTable.pollId, id))
			await trx.delete(participantTable).where(eq(participantTable.pollId, id))

			return trx
				.delete(pollTable)
				.where(eq(pollTable.id, id))
				.returning()
				.then((res) => res[0])
		})
	}

	async countGuessesByPollId(id: string) {
		return this.db
			.select({ total: count() })
			.from(guessTable)
			.innerJoin(participantTable, eq(guessTable.participantId, participantTable.id))
			.where(eq(participantTable.pollId, id))
			.then((res) => res[0]?.total ?? 0)
	}

	async findAllByUserId(userId: string) {
		return this.db
			.select({
				id: pollTable.id,
				title: pollTable.title,
				code: pollTable.code,
				createdAt: pollTable.createdAt,
				ownerId: pollTable.ownerId,
				ownerName: userTable.name,
				participants: sql<string[]>`
					(
						SELECT COALESCE(array_agg(${userTable.name} ORDER BY ${userTable.name}), ARRAY[]::text[])
						FROM ${participantTable}
						INNER JOIN ${userTable} ON ${userTable.id} = ${participantTable.userId}
						WHERE ${participantTable.pollId} = ${pollTable.id}
					)
				`.as('participants'),
			})
			.from(pollTable)
			.innerJoin(userTable, eq(pollTable.ownerId, userTable.id))
			.leftJoin(
				participantTable,
				and(
					eq(participantTable.pollId, pollTable.id),
					eq(participantTable.userId, userId),
				),
			)
			.where(or(eq(pollTable.ownerId, userId), isNotNull(participantTable.userId)))
			.groupBy(pollTable.id, userTable.name)
	}
}
