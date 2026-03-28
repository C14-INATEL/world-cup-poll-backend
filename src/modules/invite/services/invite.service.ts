import { isBefore } from 'date-fns'
import { InviteRepository } from '@/modules/invite/repositories/invite.repository'
import { ParticipantRepository } from '@/modules/participant/repositories/participant.repository'
import { InviteInsert, InviteStatus } from '@/shared/db/schemas/invite'
import { UnitOfWork } from '@/shared/db/unit-of-work'
import { BadRequestError } from '@/shared/errors/error-handler'

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

	async updateInviteStatus(id: string, status: InviteStatus, userId: string) {
		return this.unitOfWork.execute(async (trx) => {
			const invite = await this.inviteRepository.findInviteById(id, trx)

			if (!invite) {
				throw new BadRequestError('Convite não encontrado')
			}

			if (isBefore(invite.expiresAt, new Date())) {
				throw new BadRequestError(
					'Convite expirado. Solicite um novo convite para participar do bolão.',
				)
			}

			if (invite.status !== 'pending') {
				throw new BadRequestError('Convite já foi respondido')
			}

			if (invite.invitedUserId !== userId) {
				throw new BadRequestError(
					'Erro ao atualizar status do convite. Usuário não autorizado para responder a este convite.',
				)
			}

			const updatedInvite = await this.inviteRepository.updateInviteStatus(
				id,
				status,
				trx,
			)

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
