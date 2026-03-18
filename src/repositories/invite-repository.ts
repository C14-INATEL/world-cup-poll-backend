import { and, eq, gt } from 'drizzle-orm'
import { db } from '@/db'
import { InviteInsert, InviteStatus, inviteTable } from '@/db/schemas/invite'
import { InviteRepositoryInterface } from '@/repositories/interfaces/invite-interface'

export class InviteRepository implements InviteRepositoryInterface {
	async createInvite(invite: InviteInsert) {
		return db
			.insert(inviteTable)
			.values(invite)
			.returning()
			.then((res) => res[0])
	}

	async findInviteById(id: string) {
		return db
			.select()
			.from(inviteTable)
			.where(eq(inviteTable.id, id))
			.then((res) => res[0] ?? null)
	}

	async findInvitesByUserId(userId: string) {
		return db.select().from(inviteTable).where(eq(inviteTable.invitedUserId, userId))
	}

	async findExistentInvite(userId: string, pollId: string) {
		return db
			.select()
			.from(inviteTable)
			.where(
				and(
					eq(inviteTable.invitedUserId, userId),
					eq(inviteTable.pollId, pollId),
					gt(inviteTable.expiresAt, new Date()),
					eq(inviteTable.status, 'pending'),
				),
			)
			.then((res) => res[0])
	}

	async updateInviteStatus(id: string, status: InviteStatus) {
		return db
			.update(inviteTable)
			.set({ status })
			.where(and(eq(inviteTable.id, id), gt(inviteTable.expiresAt, new Date())))
			.returning()
			.then((res) => res[0])
	}
}
