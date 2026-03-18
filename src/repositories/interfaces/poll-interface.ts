import { Poll, PollInsert } from '@/db/schemas'

type PollDetails = Poll & {
	participantsCount: number
	ownerName: string
}

export interface PollRepositoryInterface {
	create(data: PollInsert): Promise<Poll>
	findByCode(code: string): Promise<Poll | null>
	findByCodeAndUserId(code: string, userId: string): Promise<PollDetails | null>
	findAllByUserId(userId: string): Promise<PollDetails[]>
}
