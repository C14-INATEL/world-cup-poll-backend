import { UserSession, UserSessionInsert } from '@/db/schemas/user_sessions'

export interface SessionRepositoryInterface {
	create(session: UserSessionInsert): Promise<UserSession>
	findByToken(sessionToken: string): Promise<UserSession>
	delete(id: string): void
}
