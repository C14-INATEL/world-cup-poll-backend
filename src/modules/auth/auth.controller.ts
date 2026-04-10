import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { AuthService } from '@/modules/auth/services/auth.service'

type AuthTokenPayload = {
	sessionToken?: string
}

export class AuthController {
	constructor(private readonly authService: AuthService) {}

	async register(request: FastifyRequest, reply: FastifyReply) {
		const registerSchema = z.object({
			name: z.string().min(1, 'O nome é obrigatório'),
			email: z.email('Formato de e-mail inválido'),
			password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
		})

		const userData = registerSchema.parse(request.body)

		const { user, session } = await this.authService.register(userData)

		const token = await reply.jwtSign(
			{ sessionToken: session.sessionToken },
			{
				sub: user.id,
				expiresIn: '7d',
			},
		)

		return reply.status(201).send({
			id: user.id,
			name: user.name,
			email: user.email,
			token,
		})
	}

	async login(request: FastifyRequest, reply: FastifyReply) {
		const loginSchema = z.object({
			email: z.email('Formato de e-mail inválido'),
			password: z.string(),
		})

		const userData = loginSchema.parse(request.body)

		const { user, session } = await this.authService.login(userData)

		const token = await reply.jwtSign(
			{ sessionToken: session.sessionToken },
			{
				sub: user.id,
				expiresIn: '7d',
			},
		)

		return reply.status(200).send({
			id: user.id,
			name: user.name,
			email: user.email,
			token,
		})
	}

	async logout(request: FastifyRequest, reply: FastifyReply) {
		const payload = await request.jwtVerify<AuthTokenPayload>()

		if (payload.sessionToken) {
			await this.authService.logout(payload.sessionToken)
		}

		return reply.status(204).send()
	}
}
