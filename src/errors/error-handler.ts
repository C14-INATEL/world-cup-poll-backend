import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import logger from '@/logger'
import { isUniqueConstraintError } from './unique-constraint-error'

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
	request: FastifyRequest,
	reply: FastifyReply,
) {
	let status = 500
	let message = 'Internal Server Error'

	if (error instanceof ZodError) {
		status = 400
		message = error.issues.map((issue) => issue.message).join('; ')
	}

	if (
		error instanceof BadRequestError ||
		error instanceof UnauthorizedError ||
		error instanceof NotFoundError ||
		error instanceof InternalServerError
	) {
		status = error.statusCode
		message = error.message
	}

	if (isUniqueConstraintError(error)) {
		status = 400
		message = 'Registro duplicado'
	}

	logger.error({
		message: message,
		stack: error.stack,
		status,
		url: request.originalUrl,
		method: request.method,
	})

	return reply.status(status).send({
		error: message,
		data: null,
	})
}
