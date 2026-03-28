import { UserSession, UserSessionInsert } from '@/shared/db/schemas'
import { DbExecutor } from '@/shared/db/unit-of-work'

export interface SessionRepositoryInterface {
	create(session: UserSessionInsert, executor?: DbExecutor): Promise<UserSession>
	findByToken(sessionToken: string): Promise<UserSession | null>
	delete(id: string, executor?: DbExecutor): Promise<void>
}
