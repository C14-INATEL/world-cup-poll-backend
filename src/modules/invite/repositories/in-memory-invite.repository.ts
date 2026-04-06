import { randomUUID } from 'crypto'
import {
	Invite,
	InviteInsert,
	InviteStatus,
} from '@/infrastructure/db/schemas/invite'

export class InMemoryInviteRepository {
	private invites: Invite[] = []

	async findExistentInvite(userId: string, pollId: string) {
		const now = new Date()

		return (
			this.invites.find(
				(invite) =>
					invite.invitedUserId === userId &&
					invite.pollId === pollId &&
					invite.status === 'pending' &&
					invite.expiresAt > now,
			) ?? null
		)
	}

	async createInvite(data: InviteInsert) {
		const invite: Invite = {
			id: randomUUID(),
			createdAt: new Date(),
			status: 'pending',
			...data,
		}

		this.invites.push(invite)

		return invite
	}

	async updateInviteStatus(id: string, status: InviteStatus) {
		const invite = this.invites.find((i) => i.id === id)

		if (!invite) return null

		const now = new Date()

		if (invite.expiresAt <= now) {
			return null
		}

		invite.status = status

		return invite
	}

	clear() {
		this.invites = []
	}

	getAll() {
		return this.invites
	}
}
