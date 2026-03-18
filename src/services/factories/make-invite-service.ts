import { InviteRepository } from '@/repositories/invite-repository'
import { InviteService } from '../invite.service'

export function makeInviteService() {
	const inviteRepository = new InviteRepository()

	return new InviteService(inviteRepository)
}
