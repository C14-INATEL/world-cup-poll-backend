import { FastifyReply, FastifyRequest } from 'fastify'

export async function responseFormatter(
	_: FastifyRequest,
	reply: FastifyReply,
	payload: any,
) {
	if (reply.statusCode >= 400) {
		return payload
	}

	let data: any

	try {
		data = typeof payload === 'string' ? JSON.parse(payload) : payload
	} catch {
		data = payload
	}

	const formattedResponse = {
		error: null,
		data,
	}

	return JSON.stringify(formattedResponse)
}
