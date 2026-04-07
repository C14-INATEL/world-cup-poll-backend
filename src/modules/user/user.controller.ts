import { FastifyReply, FastifyRequest } from 'fastify'
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
}
