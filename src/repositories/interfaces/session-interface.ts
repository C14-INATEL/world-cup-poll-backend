import { UserSession, UserSessionInsert } from '@/db/schemas'

export interface SessionRepositoryInterface {
	create(session: UserSessionInsert): Promise<UserSession>
	findByToken(sessionToken: string): Promise<UserSession>
	delete(id: string): void
}
