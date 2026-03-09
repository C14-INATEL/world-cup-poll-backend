import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { ApiError } from './api-error'

export function errorHandler(
	error: FastifyError | Error,
	_: FastifyRequest,
	reply: FastifyReply,
) {
	if (error instanceof ZodError) {
		return reply.status(400).send({
			error: error.issues[0].message,
			data: null,
		})
	}

	if (error instanceof ApiError) {
		return reply.status(error.statusCode).send({
			error: error.message,
			data: null,
		})
	}

	return reply.status(500).send({
		error: 'Erro interno no servidor',
		data: null,
	})
}
