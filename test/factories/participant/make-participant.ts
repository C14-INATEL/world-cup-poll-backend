export function makeParticipant(overrides = {}) {
	return {
		id: 'participant-1',
		userId: 'user-1',
		pollId: 'poll-1',
		...overrides,
	}
}
