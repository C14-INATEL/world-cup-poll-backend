import { Invite, InviteInsert, InviteStatus } from '@/db/schemas/invite'

export interface InviteRepositoryInterface {
	createInvite(invite: InviteInsert): Promise<Invite>
	findInviteById(id: string): Promise<Invite | null>
	findInvitesByUserId(userId: string): Promise<Invite[]>
	findExistentInvite(userId: string, pollId: string): Promise<Invite>
	updateInviteStatus(id: string, status: InviteStatus): Promise<Invite>
}
