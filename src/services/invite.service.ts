import { InviteInsert, InviteStatus } from '@/db/schemas/invite'
import { UnitOfWork } from '@/db/unit-of-work'
import { BadRequestError } from '@/errors/error-handler'
import { InviteRepository } from '@/repositories/invite-repository'
import { ParticipantRepository } from '@/repositories/participant-repository'

export class InviteService {
	constructor(
		private readonly inviteRepository: InviteRepository,
		private readonly participantRepository: ParticipantRepository,
		private readonly unitOfWork: UnitOfWork,
	) {}

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
		return this.unitOfWork.execute(async (trx) => {
			const invite = await this.inviteRepository.findInviteById(id, trx)

			if (!invite) {
				throw new BadRequestError('Convite não encontrado')
			}

			if (invite.expiresAt < new Date()) {
				throw new BadRequestError(
					'Convite expirado. Solicite um novo convite para participar do bolão.',
				)
			}

			const updatedInvite = await this.inviteRepository.updateInviteStatus(
				id,
				status,
				trx,
			)

			if (!updatedInvite) {
				throw new BadRequestError('Não foi possível atualizar o convite')
			}

			if (updatedInvite.status === 'accepted') {
				await this.participantRepository.add(
					{
						pollId: updatedInvite.pollId,
						userId: updatedInvite.invitedUserId,
					},
					trx,
				)
			}

			return updatedInvite
		})
	}
}
