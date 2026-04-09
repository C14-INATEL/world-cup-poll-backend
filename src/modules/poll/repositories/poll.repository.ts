import { and, eq, exists, isNotNull, or, sql } from 'drizzle-orm'
import { db } from '@/infrastructure/db'
import {
	PollInsert,
	participantTable,
	pollTable,
	userTable,
} from '@/infrastructure/db/schemas'
import { PollRepositoryInterface } from './poll.interface'

export class PollRepository implements PollRepositoryInterface {
	async create(data: PollInsert) {
		return db
			.insert(pollTable)
			.values(data)
			.returning()
			.then((res) => res[0])
	}

	async findById(id: string) {
		return db
			.select()
			.from(pollTable)
			.where(eq(pollTable.id, id))
			.then((res) => res[0] || null)
	}

	async findByCode(code: string) {
		return db
			.select()
			.from(pollTable)
			.where(eq(pollTable.code, code))
			.then((res) => res[0] || null)
	}

	async findByCodeAndUserId(code: string, userId: string) {
		return db
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
							db
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

	async findAllByUserId(userId: string) {
		return db
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
