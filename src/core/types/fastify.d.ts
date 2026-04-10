import 'fastify'
import '@fastify/jwt'

declare module 'fastify' {
	interface FastifyRequest {
		userId: string
		jwtVerify<T = unknown>(): Promise<T>
	}

	interface FastifyReply {
		jwtSign(
			payload: Record<string, unknown>,
			options?: { sub?: string; expiresIn?: string },
		): Promise<string>
	}
}
