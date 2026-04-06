import { UnitOfWork } from '@/infrastructure/db/unit-of-work'
import { InviteRepository } from '@/modules/invite/repositories/invite.repository'
import { ParticipantRepository } from '@/modules/participant/repositories/participant.repository'
import { InviteService } from './invite.service'

export function makeInviteService() {
	const inviteRepository = new InviteRepository()
	const participantRepository = new ParticipantRepository()
	const unitOfWork = new UnitOfWork()

	return new InviteService(inviteRepository, participantRepository, unitOfWork)
}
