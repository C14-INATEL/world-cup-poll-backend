export function makePoll(overrides = {}) {
	return {
		id: 'poll-1',
		title: 'Bolão Teste',
		code: 'ABC123DEF4',
		ownerId: 'user-1',
		createdAt: new Date(),
		...overrides,
	}
}
