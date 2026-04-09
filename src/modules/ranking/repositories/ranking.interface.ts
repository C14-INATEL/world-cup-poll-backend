export type RawParticipantGuessRow = {
	participantId: string
	userId: string
	name: string
	guessFirstTeamPoints: number
	guessSecondTeamPoints: number
	gameFirstTeamGoals: number | null
	gameSecondTeamGoals: number | null
}

export interface RankingRepositoryInterface {
	findParticipantsWithGuessesAndResults(pollId: string): Promise<RawParticipantGuessRow[]>
}
