export function makeUser(overrides = {}) {
	return {
		id: 'user-1',
		name: 'John Doe',
		email: 'john@example.com',
		passwordHash: 'hashed-password',
		createdAt: new Date(),
		...overrides,
	}
}
