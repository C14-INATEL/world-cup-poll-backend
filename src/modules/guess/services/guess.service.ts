import { isBefore } from 'date-fns'
import {
	BadRequestError,
	NotFoundError,
	UnauthorizedError,
} from '@/core/errors/error-handler'
import { calculateScore } from '@/core/utils/score'
import { GuessInsert } from '@/infrastructure/db/schemas'
import { GameRepository } from '@/modules/game/repositories/game.repository'
import { GuessRepository } from '@/modules/guess/repositories/guess.repository'
import { ParticipantRepository } from '@/modules/participant/repositories/participant.repository'

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

	async findByUserId(
		userId: string,
		options: { page: number; limit: number },
	) {
		const offset = (options.page - 1) * options.limit
		const { rows, total } = await this.guessRepository.findByUserIdWithDetails(
			userId,
			{ limit: options.limit, offset },
		)

		const items = rows.map((row) => {
			const hasResult =
				row.gameFirstTeamGoals !== null && row.gameSecondTeamGoals !== null
			const points = hasResult
				? calculateScore({
					guessFirst: row.guessFirstTeamPoints,
					guessSecond: row.guessSecondTeamPoints,
					actualFirst: row.gameFirstTeamGoals!,
					actualSecond: row.gameSecondTeamGoals!,
				})
				: null

			let status: 'Pendente' | 'Acertou' | 'Errou' | 'Parcial'
			if (!hasResult) {
				status = 'Pendente'
			} else if (points === 5) {
				status = 'Acertou'
			} else if (points === 0) {
				status = 'Errou'
			} else {
				status = 'Parcial'
			}

			return {
				id: row.guessId,
				createdAt: row.guessCreatedAt.toISOString(),
				firstTeamPoints: row.guessFirstTeamPoints,
				secondTeamPoints: row.guessSecondTeamPoints,
				poll: {
					id: row.pollId,
					title: row.pollTitle,
				},
				game: {
					id: row.gameId,
					date: row.gameDate,
					firstTeamName: row.gameFirstTeamName,
					secondTeamName: row.gameSecondTeamName,
					firstTeamCountryCode: row.gameFirstTeamCountryCode,
					secondTeamCountryCode: row.gameSecondTeamCountryCode,
				},
				result: {
					status,
					points,
				},
			}
		})

		return {
			items,
			page: options.page,
			limit: options.limit,
			total,
			hasMore: offset + items.length < total,
		}
	}
}
