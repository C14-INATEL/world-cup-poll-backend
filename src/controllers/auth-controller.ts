import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { AuthService } from '@/services/auth.service'

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

		reply.setCookie('session_id', session.sessionToken, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			expires: session.expiresAt,
		})

		return reply.status(201).send({
			id: user.id,
			name: user.name,
			email: user.email,
		})
	}

	async login(request: FastifyRequest, reply: FastifyReply) {
		const loginSchema = z.object({
			email: z.email('Formato de e-mail inválido'),
			password: z.string(),
		})

		const userData = loginSchema.parse(request.body)

		const { user, session } = await this.authService.login(userData)

		reply.setCookie('session_id', session.sessionToken, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			expires: session.expiresAt,
		})

		return reply.status(200).send({
			id: user.id,
			name: user.name,
			email: user.email,
		})
	}

	async logout(request: FastifyRequest, reply: FastifyReply) {
		if (request.cookies['session_id']) {
			await this.authService.logout(request.cookies['session_id'])
		}

		reply.clearCookie('session_id', { path: '/' })

		return reply.status(204).send()
	}
}
