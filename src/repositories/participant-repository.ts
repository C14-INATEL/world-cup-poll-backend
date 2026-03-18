import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { ParticipantInsert, participantTable, userTable } from '@/db/schemas'
import { ParticipantRepositoryInterface } from './interfaces/participant-interface'

export class ParticipantRepository implements ParticipantRepositoryInterface {
	async findByUserId(userId: string) {
		return db
			.select()
			.from(participantTable)
			.where(eq(participantTable.userId, userId))
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

	async add(data: ParticipantInsert) {
		return db
			.insert(participantTable)
			.values(data)
			.returning()
			.then((res) => res[0])
	}
}
