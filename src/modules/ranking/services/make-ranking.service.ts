import { ParticipantRepository } from '@/modules/participant/repositories/participant.repository'
import { PollRepository } from '@/modules/poll/repositories/poll.repository'
import { RankingRepository } from '../repositories/ranking.repository'
import { RankingService } from './ranking.service'

export function makeRankingService() {
	const rankingRepository = new RankingRepository()
	const pollRepository = new PollRepository()
	const participantRepository = new ParticipantRepository()

	return new RankingService(rankingRepository, pollRepository, participantRepository)
}
