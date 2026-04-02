export function makeGame(overrides = {}) {
	return {
		id: 'game-1',
		apiId: 1,
		date: new Date(Date.now() + 60_000),
		firstTeamName: 'Brasil',
		secondTeamName: 'Argentina',
		firstTeamGoals: null,
		secondTeamGoals: null,
		firstTeamCrest: null,
		secondTeamCrest: null,
		status: 'SCHEDULED',
		...overrides,
	}
}
