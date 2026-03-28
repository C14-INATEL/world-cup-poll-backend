import { PollRepository } from '@/modules/poll/repositories/poll.repository'
import { PollService } from './poll.service'

export function makePollService() {
	const pollRepository = new PollRepository()

	return new PollService(pollRepository)
}
