export function makeSession(overrides = {}) {
	return {
		id: 'session-1',
		userId: 'user-1',
		sessionToken: 'token-uuid',
		expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		createdAt: new Date(),
		...overrides,
	}
}
