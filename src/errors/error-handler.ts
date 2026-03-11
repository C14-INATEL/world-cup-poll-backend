import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'

export class BadRequestError extends Error {
	statusCode = 400
	constructor(message = 'Bad Request') {
		super(message)
		this.name = 'BadRequestError'
	}
}

export class UnauthorizedError extends Error {
	statusCode = 401
	constructor(message = 'Unauthorized') {
		super(message)
		this.name = 'UnauthorizedError'
	}
}

export class NotFoundError extends Error {
	statusCode = 404
	constructor(message = 'Not Found') {
		super(message)
		this.name = 'NotFoundError'
	}
}

export class InternalServerError extends Error {
	statusCode = 500
	constructor(message = 'Internal Server Error') {
		super(message)
		this.name = 'InternalServerError'
	}
}

type CustomError =
	| BadRequestError
	| UnauthorizedError
	| NotFoundError
	| InternalServerError
	| FastifyError
	| Error

export function errorHandler(
	error: CustomError,
	_: FastifyRequest,
	reply: FastifyReply,
) {
	if (error instanceof ZodError) {
		return reply.status(400).send({
			error: error.issues[0].message,
			data: null,
		})
	}

	if (
		error instanceof BadRequestError ||
		error instanceof UnauthorizedError ||
		error instanceof NotFoundError ||
		error instanceof InternalServerError
	) {
		return reply.status(error.statusCode).send({
			error: error.message,
			data: null,
		})
	}

	return reply.status(500).send({
		error: 'Internal Server Error',
		data: null,
	})
}
