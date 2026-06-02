import { Poll } from '@/infrastructure/db/schemas'

export function makePoll(overrides: Partial<Poll> = {}): Poll {
	return {
		id: crypto.randomUUID(),
		title: 'Bolão Teste',
		code: 'ABC123DEF4',
		ownerId: crypto.randomUUID(),
		createdAt: new Date(),
		...overrides,
	}
}
