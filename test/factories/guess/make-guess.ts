export function makeGuess(overrides = {}) {
	return {
		id: 'guess-1',
		participantId: 'participant-1',
		gameId: 'game-1',
		firstTeamPoints: 2,
		secondTeamPoints: 1,
		createdAt: new Date(),
		...overrides,
	}
}
