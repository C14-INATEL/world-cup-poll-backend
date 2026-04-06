export function makeInvite(overrides = {}) {
	return {
		id: 'invite-1',
		invitedUserId: 'user-1',
		pollId: 'poll-1',
		invitedBy: 'user-2',
		expiresAt: new Date(Date.now() + 1000),
		status: 'pending',
		...overrides,
	}
}
