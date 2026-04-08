import { Poll, PollInsert } from '@/infrastructure/db/schemas'

export type PollDetails = Poll & {
	ownerName: string
}

export type PollListItem = Poll & {
	ownerName: string
	participants: string[]
}

export interface PollRepositoryInterface {
	create(data: PollInsert): Promise<Poll>
	findByCode(code: string): Promise<Poll | null>
	findByCodeAndUserId(code: string, userId: string): Promise<PollDetails | null>
	findAllByUserId(userId: string): Promise<PollListItem[]>
}
