import { UserSession, UserSessionInsert } from '@/infrastructure/db/schemas'
import { DbExecutor } from '@/infrastructure/db/unit-of-work'

export interface SessionRepositoryInterface {
	create(session: UserSessionInsert, executor?: DbExecutor): Promise<UserSession>
	findByToken(sessionToken: string): Promise<UserSession | null>
	delete(id: string, executor?: DbExecutor): Promise<void>
}
