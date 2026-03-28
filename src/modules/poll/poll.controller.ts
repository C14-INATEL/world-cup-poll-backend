import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { PollService } from '@/modules/poll/services/poll.service'

export class PollController {
	constructor(private pollService: PollService) {}

	async create(request: FastifyRequest, reply: FastifyReply) {
		const bodySchema = z.object({
			title: z.string().min(1, 'O título é obrigatório'),
			code: z.string().length(10, 'Tamanho mínimo do código é 10 caracteres'),
		})

		const { title, code } = bodySchema.parse(request.body)

		const poll = await this.pollService.create({
			title,
			code,
			ownerId: request.userId,
		})

		reply.status(201).send(poll)
	}

	async find(request: FastifyRequest, reply: FastifyReply) {
		const paramsSchema = z.object({
			code: z.string().length(10, 'Código inválido'),
		})

		const { code } = paramsSchema.parse(request.params)

		const poll = await this.pollService.findByCode(code, request.userId)

		reply.status(200).send(poll)
	}

	async findAllUserPolls(request: FastifyRequest, reply: FastifyReply) {
		const polls = await this.pollService.findAllByUserId(request.userId)

		reply.status(200).send(polls)
	}
}
