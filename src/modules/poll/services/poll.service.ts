import { BadRequestError, NotFoundError, UnauthorizedError } from '@/core/errors/error-handler'
import { PollInsert } from '@/infrastructure/db/schemas'
import { ParticipantRepository } from '@/modules/participant/repositories/participant.repository'
import { PollRepository } from '@/modules/poll/repositories/poll.repository'

export class PollService {
	constructor(
		private readonly pollRepository: PollRepository,
		private readonly participantRepository: ParticipantRepository,
	) {}

	async create(data: PollInsert) {
		const existentPollCode = await this.pollRepository.findByCode(data.code)

		if (existentPollCode) {
			throw new BadRequestError('Já existe um bolão com este código')
		}

		const poll = await this.pollRepository.create(data)

		await this.participantRepository.add({
			pollId: poll.id,
			userId: poll.ownerId,
		})

		return poll
	}

	async findByCode(code: string, userId: string) {
		const poll = await this.pollRepository.findByCodeAndUserId(code, userId)

		if (!poll) {
			throw new NotFoundError('Bolão não existente')
		}

		return poll
	}

	async findAllByUserId(userId: string) {
		return this.pollRepository.findAllByUserId(userId)
	}

	async updateTitle(id: string, title: string, userId: string) {
		const poll = await this.pollRepository.findById(id)

		if (!poll) {
			throw new NotFoundError('Bolão não encontrado')
		}

		if (poll.ownerId !== userId) {
			throw new UnauthorizedError('Apenas o dono pode editar o bolão')
		}

		return this.pollRepository.updateTitle(id, title)
	}

	async delete(id: string, userId: string) {
		const poll = await this.pollRepository.findById(id)

		if (!poll) {
			throw new NotFoundError('Bolão não encontrado')
		}

		if (poll.ownerId !== userId) {
			throw new UnauthorizedError('Apenas o dono pode excluir o bolão')
		}

		return this.pollRepository.delete(id)
	}
}
