import { and, desc, eq, gt, sql } from 'drizzle-orm'
import type { AppDb } from '@/infrastructure/db'
import {
	InviteInsert,
	InviteStatus,
	inviteTable,
} from '@/infrastructure/db/schemas/invite'
import { pollTable } from '@/infrastructure/db/schemas/poll'
import { userTable } from '@/infrastructure/db/schemas/user'
import { DbExecutor } from '@/infrastructure/db/unit-of-work'
import { InviteRepositoryInterface } from '@/modules/invite/repositories/invite.interface'

export class InviteRepository implements InviteRepositoryInterface {
	constructor(private readonly db: AppDb) {}

	async createInvite(invite: InviteInsert, executor: DbExecutor = this.db) {
		return executor
			.insert(inviteTable)
			.values(invite)
			.returning()
			.then((res) => res[0])
	}

	async findInviteById(id: string, executor: DbExecutor = this.db) {
		return executor
			.select()
			.from(inviteTable)
			.where(eq(inviteTable.id, id))
			.then((res) => res[0] ?? null)
	}

	async findInvitesByUserId(userId: string) {
		return this.db
			.select({
				id: inviteTable.id,
				pollId: inviteTable.pollId,
				invitedUserId: inviteTable.invitedUserId,
				invitedBy: inviteTable.invitedBy,
				status: inviteTable.status,
				expiresAt: inviteTable.expiresAt,
				createdAt: inviteTable.createdAt,
				pollTitle: pollTable.title,
				pollCode: pollTable.code,
				invitedByName: userTable.name,
			})
			.from(inviteTable)
			.innerJoin(pollTable, eq(pollTable.id, inviteTable.pollId))
			.innerJoin(userTable, eq(userTable.id, inviteTable.invitedBy))
			.where(
				and(
					eq(inviteTable.invitedUserId, userId),
					eq(inviteTable.status, 'pending'),
					gt(inviteTable.expiresAt, sql`NOW()`),
				),
			)
			.orderBy(desc(inviteTable.createdAt))
	}

	async findExistentInvite(
		userId: string,
		pollId: string,
		executor: DbExecutor = this.db,
	) {
		return executor
			.select()
			.from(inviteTable)
			.where(
				and(
					eq(inviteTable.invitedUserId, userId),
					eq(inviteTable.pollId, pollId),
					gt(inviteTable.expiresAt, sql`NOW()`),
					eq(inviteTable.status, 'pending'),
				),
			)
			.then((res) => res[0] ?? null)
	}

	async updateInviteStatus(
		id: string,
		status: InviteStatus,
		executor: DbExecutor = this.db,
	) {
		return executor
			.update(inviteTable)
			.set({ status })
			.where(and(eq(inviteTable.id, id), gt(inviteTable.expiresAt, sql`NOW()`)))
			.returning()
			.then((res) => res[0] ?? null)
	}
}
