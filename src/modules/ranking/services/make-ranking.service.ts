import type { AppDb } from '@/infrastructure/db'
import { ParticipantRepository } from '@/modules/participant/repositories/participant.repository'
import { PollRepository } from '@/modules/poll/repositories/poll.repository'
import { RankingRepository } from '../repositories/ranking.repository'
import { RankingService } from './ranking.service'

export function makeRankingService(db: AppDb) {
	const rankingRepository = new RankingRepository(db)
	const pollRepository = new PollRepository(db)
	const participantRepository = new ParticipantRepository(db)

	return new RankingService(rankingRepository, pollRepository, participantRepository)
}
