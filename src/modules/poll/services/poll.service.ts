import { PollRepository } from '@/modules/poll/repositories/poll.repository'
import { PollInsert } from '@/shared/db/schemas'
import { BadRequestError, NotFoundError } from '@/shared/errors/error-handler'

export class PollService {
	constructor(private readonly pollRepository: PollRepository) {}

	async create(data: PollInsert) {
		const existentPollCode = await this.pollRepository.findByCode(data.code)

		if (existentPollCode) {
			throw new BadRequestError('Já existe um bolão com este código')
		}

		return this.pollRepository.create(data)
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
}
