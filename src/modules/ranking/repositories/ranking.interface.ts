export type RawParticipantGuessRow = {
	participantId: string
	userId: string
	name: string
	guessFirstTeamPoints: number
	guessSecondTeamPoints: number
	gameFirstTeamGoals: number
	gameSecondTeamGoals: number
}

export interface RankingRepositoryInterface {
	findParticipantsWithGuessesAndResults(
		pollId: string,
	): Promise<RawParticipantGuessRow[]>
}
