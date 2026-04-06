import {
	Invite,
	InviteInsert,
	InviteStatus,
} from '@/infrastructure/db/schemas/invite'
import { DbExecutor } from '@/infrastructure/db/unit-of-work'

export interface InviteRepositoryInterface {
	createInvite(invite: InviteInsert, executor?: DbExecutor): Promise<Invite>
	findInviteById(id: string, executor?: DbExecutor): Promise<Invite | null>
	findInvitesByUserId(userId: string): Promise<Invite[]>
	findExistentInvite(
		userId: string,
		pollId: string,
		executor?: DbExecutor,
	): Promise<Invite | null>
	updateInviteStatus(
		id: string,
		status: InviteStatus,
		executor?: DbExecutor,
	): Promise<Invite | null>
}
