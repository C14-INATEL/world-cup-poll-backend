import { ParticipantRepository } from '@/modules/participant/repositories/participant.repository'
import { PollRepository } from '@/modules/poll/repositories/poll.repository'
import { PollService } from './poll.service'

export function makePollService() {
	const pollRepository = new PollRepository()
	const participantRepository = new ParticipantRepository()

	return new PollService(pollRepository, participantRepository)
}
