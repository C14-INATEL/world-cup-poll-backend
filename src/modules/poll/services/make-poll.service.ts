import type { AppDb } from '@/infrastructure/db'
import { ParticipantRepository } from '@/modules/participant/repositories/participant.repository'
import { PollRepository } from '@/modules/poll/repositories/poll.repository'
import { PollService } from './poll.service'

export function makePollService(db: AppDb) {
	const pollRepository = new PollRepository(db)
	const participantRepository = new ParticipantRepository(db)

	return new PollService(pollRepository, participantRepository)
}
