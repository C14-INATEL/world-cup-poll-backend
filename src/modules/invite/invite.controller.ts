import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { InviteService } from '@/modules/invite/services/invite.service'

export class InviteController {
	constructor(private inviteService: InviteService) {}

	async create(request: FastifyRequest, reply: FastifyReply) {
		const inviteSchema = z.object({
			pollId: z.string().min(1, 'ID do bolão é obrigatório'),
			invitedUserId: z.string().min(1, 'Selecione um usuário para convidar'),
		})

		const { pollId, invitedUserId } = inviteSchema.parse(request.body)

		const invite = await this.inviteService.create({
			pollId,
			invitedUserId,
			invitedBy: request.userId,
		})

		reply.status(201).send(invite)
	}

	async findUserInvites(request: FastifyRequest, reply: FastifyReply) {
		const invites = await this.inviteService.findUserInvites(request.userId)

		reply.status(200).send(invites)
	}

	async changeInviteStatus(request: FastifyRequest, reply: FastifyReply) {
		const paramsSchema = z.object({
			id: z.string().min(1, 'ID do convite é obrigatório'),
		})

		const { id } = paramsSchema.parse(request.params)

		const bodySchema = z.object({
			status: z.enum(['accepted', 'declined'], 'Status inválido'),
		})

		const { status } = bodySchema.parse(request.body)

		const invite = await this.inviteService.updateInviteStatus(
			id,
			status,
			request.userId,
		)

		reply.status(200).send(invite)
	}
}
