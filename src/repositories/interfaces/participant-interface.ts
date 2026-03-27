import { Participant, ParticipantInsert } from '@/db/schemas'
import { DbExecutor } from '@/db/unit-of-work'

export interface ParticipantRepositoryInterface {
	findById(id: string): Promise<Participant | null>
	findByUserId(userId: string): Promise<Participant | null>
	findByUserIdAndPollId(userId: string, pollId: string): Promise<Participant | null>
	findAll(pollId: string): Promise<{ userId: string; name: string; email: string }[]>
	add(data: ParticipantInsert, executor?: DbExecutor): Promise<Participant>
}
