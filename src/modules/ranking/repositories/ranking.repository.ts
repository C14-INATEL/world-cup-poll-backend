import { and, eq, isNotNull } from 'drizzle-orm'
import type { AppDb } from '@/infrastructure/db'
import {
	gameTable,
	guessTable,
	participantTable,
	userTable,
} from '@/infrastructure/db/schemas'
import {
	RankingRepositoryInterface,
	type RawParticipantGuessRow,
} from './ranking.interface'

export class RankingRepository implements RankingRepositoryInterface {
	constructor(private readonly db: AppDb) {}

	async findParticipantsWithGuessesAndResults(pollId: string) {
		const rows = await this.db
			.select({
				participantId: participantTable.id,
				userId: participantTable.userId,
				name: userTable.name,
				guessFirstTeamPoints: guessTable.firstTeamPoints,
				guessSecondTeamPoints: guessTable.secondTeamPoints,
				gameFirstTeamGoals: gameTable.firstTeamGoals,
				gameSecondTeamGoals: gameTable.secondTeamGoals,
			})
			.from(participantTable)
			.innerJoin(userTable, eq(userTable.id, participantTable.userId))
			.innerJoin(guessTable, eq(guessTable.participantId, participantTable.id))
			.innerJoin(gameTable, eq(gameTable.id, guessTable.gameId))
			.where(
				and(
					eq(participantTable.pollId, pollId),
					isNotNull(gameTable.firstTeamGoals),
					isNotNull(gameTable.secondTeamGoals),
				),
			)

		return rows.map(
			(row): RawParticipantGuessRow => ({
				...row,
				gameFirstTeamGoals: row.gameFirstTeamGoals!,
				gameSecondTeamGoals: row.gameSecondTeamGoals!,
			}),
		)
	}
}
