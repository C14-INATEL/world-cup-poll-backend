import { Participant, ParticipantInsert } from '@/db/schemas'

export interface ParticipantRepositoryInterface {
	findByUserId(userId: string): Promise<Participant | null>
	findAll(pollId: string): Promise<{ userId: string; name: string; email: string }[]>
	add(data: ParticipantInsert): Promise<Participant>
}
