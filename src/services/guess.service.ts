import { isBefore } from 'date-fns'
import { GuessInsert } from '@/db/schemas'
import {
	BadRequestError,
	NotFoundError,
	UnauthorizedError,
} from '@/errors/error-handler'
import { GameRepository } from '@/repositories/game-repository'
import { GuessRepository } from '@/repositories/guess-repository'
import { ParticipantRepository } from '@/repositories/participant-repository'

export class GuessService {
	constructor(
		private readonly guessRepository: GuessRepository,
		private readonly gameRepository: GameRepository,
		private readonly participantRepository: ParticipantRepository,
	) {}

	async create(
		data: Omit<GuessInsert, 'participantId'>,
		userId: string,
		pollId: string,
	) {
		const participant = await this.participantRepository.findByUserIdAndPollId(
			userId,
			pollId,
		)

		if (!participant) {
			throw new BadRequestError('Deve ser um participante válido')
		}

		const match = await this.gameRepository.findById(data.gameId)

		if (!match) {
			throw new NotFoundError('Jogo não encontrado')
		}

		if (isBefore(match.date, new Date())) {
			throw new BadRequestError('Palpites fechados')
		}

		return this.guessRepository.create({
			gameId: data.gameId,
			firstTeamPoints: data.firstTeamPoints,
			secondTeamPoints: data.secondTeamPoints,
			participantId: participant.id,
		})
	}

	async update({
		data,
		guessId,
		pollId,
		userId,
	}: {
		data: {
			firstTeamPoints?: number
			secondTeamPoints?: number
		}
		guessId: string
		pollId: string
		userId: string
	}) {
		const participant = await this.participantRepository.findByUserIdAndPollId(
			userId,
			pollId,
		)

		if (!participant) {
			throw new BadRequestError('Usuário não participa deste bolão')
		}

		const guess = await this.guessRepository.findById(guessId)

		if (!guess) {
			throw new NotFoundError('Palpite não encontrado')
		}

		if (guess.participantId !== participant.id) {
			throw new UnauthorizedError('Você não pode alterar este palpite')
		}

		const match = await this.gameRepository.findById(guess.gameId)

		if (!match) {
			throw new NotFoundError('Jogo não encontrado')
		}

		if (isBefore(match.date, new Date())) {
			throw new BadRequestError('Palpites fechados')
		}

		return this.guessRepository.update({
			id: guessId,
			guess: {
				firstTeamPoints: data.firstTeamPoints,
				secondTeamPoints: data.secondTeamPoints,
			},
		})
	}

	async findByParticipantId(participantId: string) {
		return this.guessRepository.findByParticipantId(participantId)
	}

	async findByGameId(gameId: string) {
		return this.guessRepository.findAllByGameId(gameId)
	}
}
