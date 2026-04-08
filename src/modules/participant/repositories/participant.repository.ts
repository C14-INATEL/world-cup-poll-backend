import { and, eq } from 'drizzle-orm'
import { db } from '@/infrastructure/db'
import {
	ParticipantInsert,
	participantTable,
	userTable,
} from '@/infrastructure/db/schemas'
import { DbExecutor } from '@/infrastructure/db/unit-of-work'
import { ParticipantRepositoryInterface } from './participant.interface'

export class ParticipantRepository implements ParticipantRepositoryInterface {
	async findById(id: string) {
		return db
			.select()
			.from(participantTable)
			.where(eq(participantTable.id, id))
			.then((res) => res[0] || null)
	}

	async findByUserId(userId: string) {
		return db
			.select()
			.from(participantTable)
			.where(eq(participantTable.userId, userId))
			.then((res) => res[0] || null)
	}

	async findByUserIdAndPollId(userId: string, pollId: string) {
		return db
			.select()
			.from(participantTable)
			.where(
				and(
					eq(participantTable.userId, userId),
					eq(participantTable.pollId, pollId),
				),
			)
			.then((res) => res[0] || null)
	}

	async findAll(pollId: string) {
		return db
			.select({
				userId: participantTable.userId,
				name: userTable.name,
				email: userTable.email,
			})
			.from(participantTable)
			.innerJoin(userTable, eq(participantTable.userId, userTable.id))
			.where(eq(participantTable.pollId, pollId))
	}

	async getParticipantsByPollId(pollId: string) {
		return db
			.select({
				userId: participantTable.userId,
				name: userTable.name,
				email: userTable.email,
			})
			.from(participantTable)
			.innerJoin(userTable, eq(participantTable.userId, userTable.id))
			.where(eq(participantTable.pollId, pollId))
	}

	async add(data: ParticipantInsert, executor: DbExecutor = db) {
		return executor
			.insert(participantTable)
			.values(data)
			.returning()
			.then((res) => res[0])
	}
}
