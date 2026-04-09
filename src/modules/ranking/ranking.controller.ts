import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { RankingService } from '@/modules/ranking/services/ranking.service'

export class RankingController {
	constructor(private readonly rankingService: RankingService) {}

	async getRanking(request: FastifyRequest, reply: FastifyReply) {
		const paramsSchema = z.object({
			pollId: z.string('ID do bolão é obrigatório'),
		})

		const { pollId } = paramsSchema.parse(request.params)

		const ranking = await this.rankingService.getRanking(pollId, request.userId)

		reply.status(200).send(ranking)
	}
}
