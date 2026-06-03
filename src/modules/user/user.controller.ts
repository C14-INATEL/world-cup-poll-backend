import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { UserService } from './services/user.service'

export class UserController {
	constructor(private readonly userService: UserService) {}

	async getProfile(request: FastifyRequest, reply: FastifyReply) {
		const userId = request.userId

		const user = await this.userService.findUserById(userId)

		if (!user) {
			return reply
				.status(404)
				.send({ message: 'Usuário não encontrado. Faça login para continuar' })
		}

		return reply.status(200).send(user)
	}

	async search(request: FastifyRequest, reply: FastifyReply) {
		const querySchema = z.object({
			query: z.string().trim().min(2, 'Digite pelo menos 2 caracteres'),
		})

		const { query } = querySchema.parse(request.query)
		const users = await this.userService.searchUsers(query, request.userId)

		return reply.status(200).send(users)
	}

	async updateProfile(request: FastifyRequest, reply: FastifyReply) {
		const bodySchema = z.object({
			name: z.string().trim().min(1, 'O nome e obrigatorio'),
			email: z.email('Formato de e-mail invalido'),
		})

		const data = bodySchema.parse(request.body)
		const user = await this.userService.updateProfile(request.userId, data)

		return reply.status(200).send(user)
	}
}
