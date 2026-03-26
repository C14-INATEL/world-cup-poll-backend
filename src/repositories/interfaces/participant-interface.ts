import { Participant, ParticipantInsert } from '@/db/schemas'
import { DbExecutor } from '@/db/unit-of-work'

export interface ParticipantRepositoryInterface {
	findByUserId(userId: string): Promise<Participant | null>
	findAll(pollId: string): Promise<{ userId: string; name: string; email: string }[]>
	add(data: ParticipantInsert, executor?: DbExecutor): Promise<Participant>
}
