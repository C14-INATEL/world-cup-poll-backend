import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { GuessService } from '@/modules/guess/services/guess.service'

export class GuessController {
	constructor(private guessService: GuessService) {}

	async create(request: FastifyRequest, reply: FastifyReply) {
		const bodySchema = z.object({
			firstTeamPoints: z
				.number()
				.int()
				.nonnegative(
					'Gols da primeira equipe devem ser um número inteiro não negativo',
				)
				.max(20, 'Gols da primeira equipe devem ser no máximo 20'),
			secondTeamPoints: z
				.number()
				.int()
				.nonnegative(
					'Gols da segunda equipe devem ser um número inteiro não negativo',
				)
				.max(20, 'Gols da segunda equipe devem ser no máximo 20'),
			gameId: z.string('ID do jogo é obrigatório'),
		})

		const validatedBody = bodySchema.parse(request.body)

		const paramsSchema = z.object({
			pollId: z.string('ID do bolão é obrigatório'),
		})

		const { pollId } = paramsSchema.parse(request.params)

		const createdGuess = await this.guessService.create(
			validatedBody,
			request.userId,
			pollId,
		)

		reply.status(201).send(createdGuess)
	}

	async update(request: FastifyRequest, reply: FastifyReply) {
		const bodySchema = z.object({
			firstTeamPoints: z
				.number()
				.int()
				.nonnegative(
					'Gols da primeira equipe devem ser um número inteiro não negativo',
				)
				.max(20, 'Gols da primeira equipe devem ser no máximo 20')
				.optional(),
			secondTeamPoints: z
				.number()
				.int()
				.nonnegative(
					'Gols da segunda equipe devem ser um número inteiro não negativo',
				)
				.max(20, 'Gols da segunda equipe devem ser no máximo 20')
				.optional(),
		})

		const validatedBody = bodySchema.parse(request.body)

		const paramsSchema = z.object({
			pollId: z.string('ID do bolão é obrigatório'),
			guessId: z.string('ID do palpite é obrigatório'),
		})

		const { pollId, guessId } = paramsSchema.parse(request.params)

		const updatedGuess = await this.guessService.update({
			data: validatedBody,
			guessId,
			pollId,
			userId: request.userId,
		})

		reply.status(200).send(updatedGuess)
	}

	async findByParticipantId(request: FastifyRequest, reply: FastifyReply) {
		const paramsSchema = z.object({
			participantId: z.string('ID do participante é obrigatório'),
		})

		const { participantId } = paramsSchema.parse(request.params)

		const guess = await this.guessService.findByParticipantId(participantId)

		reply.status(200).send(guess)
	}

	async findByGameId(request: FastifyRequest, reply: FastifyReply) {
		const paramsSchema = z.object({
			gameId: z.string('ID do jogo é obrigatório'),
		})

		const { gameId } = paramsSchema.parse(request.params)

		const guesses = await this.guessService.findByGameId(gameId)

		reply.status(200).send(guesses)
	}
}
