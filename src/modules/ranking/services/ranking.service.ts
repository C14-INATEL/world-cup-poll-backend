import { NotFoundError, UnauthorizedError } from '@/core/errors/error-handler'
import { calculateScore } from '@/core/utils/score'
import { PollRepositoryInterface } from '@/modules/poll/repositories/poll.interface'
import { ParticipantRepositoryInterface } from '@/modules/participant/repositories/participant.interface'
import { RankingRepositoryInterface } from '../repositories/ranking.interface'

export type RankingEntry = {
	position: number
	userId: string
	name: string
	totalPoints: number
	guessesCount: number
}

export class RankingService {
	constructor(
		private readonly rankingRepository: RankingRepositoryInterface,
		private readonly pollRepository: PollRepositoryInterface,
		private readonly participantRepository: ParticipantRepositoryInterface,
	) {}

	async getRanking(pollId: string, userId: string): Promise<RankingEntry[]> {
		const [participant, poll] = await Promise.all([
			this.participantRepository.findByUserIdAndPollId(userId, pollId),
			this.pollRepository.findById(pollId),
		])

		if (!poll) {
			throw new NotFoundError('Bolão não encontrado')
		}

		const isOwner = poll.ownerId === userId
		const isParticipant = participant !== null

		if (!isOwner && !isParticipant) {
			throw new UnauthorizedError('Você não tem acesso a este bolão')
		}

		const rows = await this.rankingRepository.findParticipantsWithGuessesAndResults(pollId)

		const aggregated = new Map<
			string,
			{ userId: string; name: string; totalPoints: number; guessesCount: number }
		>()

		for (const row of rows) {
			const points = calculateScore({
				guessFirst: row.guessFirstTeamPoints,
				guessSecond: row.guessSecondTeamPoints,
				actualFirst: row.gameFirstTeamGoals!,
				actualSecond: row.gameSecondTeamGoals!,
			})

			const existing = aggregated.get(row.participantId) ?? {
				userId: row.userId,
				name: row.name,
				totalPoints: 0,
				guessesCount: 0,
			}

			aggregated.set(row.participantId, {
				...existing,
				totalPoints: existing.totalPoints + points,
				guessesCount: existing.guessesCount + 1,
			})
		}

		const sorted = [...aggregated.values()].sort((a, b) => b.totalPoints - a.totalPoints)

		const ranked: RankingEntry[] = []
		let currentPosition = 1

		for (let i = 0; i < sorted.length; i++) {
			if (i > 0 && sorted[i].totalPoints < sorted[i - 1].totalPoints) {
				currentPosition = i + 1
			}
			ranked.push({ position: currentPosition, ...sorted[i] })
		}

		return ranked
	}
}
