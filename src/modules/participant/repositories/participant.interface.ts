import { Participant, ParticipantInsert } from '@/infrastructure/db/schemas'
import { DbExecutor } from '@/infrastructure/db/unit-of-work'

export interface ParticipantRepositoryInterface {
	findById(id: string): Promise<Participant | null>
	findByUserId(userId: string): Promise<Participant | null>
	findByUserIdAndPollId(userId: string, pollId: string): Promise<Participant | null>
	findAll(pollId: string): Promise<{ userId: string; name: string; email: string }[]>
	getParticipantsByPollId(
		pollId: string,
	): Promise<{ userId: string; name: string; email: string }[]>
	add(data: ParticipantInsert, executor?: DbExecutor): Promise<Participant>
}
