import type { AppDb } from '@/infrastructure/db'
import { UnitOfWork } from '@/infrastructure/db/unit-of-work'
import { InviteRepository } from '@/modules/invite/repositories/invite.repository'
import { ParticipantRepository } from '@/modules/participant/repositories/participant.repository'
import { InviteService } from './invite.service'

export function makeInviteService(db: AppDb) {
	const inviteRepository = new InviteRepository(db)
	const participantRepository = new ParticipantRepository(db)
	const unitOfWork = new UnitOfWork(db)

	return new InviteService(inviteRepository, participantRepository, unitOfWork)
}
