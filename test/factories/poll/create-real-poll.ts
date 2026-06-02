import { randomUUID } from 'crypto'
import { AppDb } from '@/infrastructure/db'
import { PollInsert, pollTable } from '@/infrastructure/db/schemas'

export async function createRealPollFactory(db: AppDb, data?: Partial<PollInsert>) {
	const [poll] = await db
		.insert(pollTable)
		.values({
			code: data?.code ?? 'TESTPOLL01',
			title: data?.title ?? 'Test Poll',
			ownerId: data?.ownerId ?? randomUUID(),
		})
		.returning()

	return poll
}
