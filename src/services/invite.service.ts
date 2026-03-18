import { InviteInsert, InviteStatus } from '@/db/schemas/invite'
import { BadRequestError } from '@/errors/error-handler'
import { InviteRepository } from '@/repositories/invite-repository'

export class InviteService {
	constructor(private readonly inviteRepository: InviteRepository) {}

	async create(data: Omit<InviteInsert, 'expiresAt'>) {
		const userAlreadyInvited = await this.inviteRepository.findExistentInvite(
			data.invitedUserId,
			data.pollId,
		)

		if (userAlreadyInvited) {
			throw new BadRequestError('Usuário já tem um convite pendente')
		}

		const expiresAt = new Date()
		expiresAt.setHours(expiresAt.getHours() + 24)

		return this.inviteRepository.createInvite({ ...data, expiresAt })
	}

	async findUserInvites(userId: string) {
		return this.inviteRepository.findInvitesByUserId(userId)
	}

	async updateInviteStatus(id: string, status: InviteStatus) {
		const invite = await this.inviteRepository.updateInviteStatus(id, status)

		if (!invite) {
			throw new BadRequestError('Convite não encontrado')
		}

		return invite
	}
}
