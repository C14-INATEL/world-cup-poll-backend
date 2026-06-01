import { hashPassword } from '@/core/utils/password'
import type { AppDb } from '@/infrastructure/db'
import { userTable } from '@/infrastructure/db/schemas'

export async function createRealUserFactory(
	db: AppDb,
	data?: {
		name?: string
		email?: string
		password?: string
	},
) {
	const passwordHash = await hashPassword(data?.password ?? '123456')

	const [user] = await db
		.insert(userTable)
		.values({
			name: data?.name ?? 'John',
			email: data?.email ?? 'john@email.com',
			passwordHash,
		})
		.returning()

	return user
}
