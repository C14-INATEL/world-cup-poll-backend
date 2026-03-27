import { FastifyReply, FastifyRequest } from 'fastify'
import { GameService } from '@/services/game.service'

export class GameController {
	constructor(private gameService: GameService) {}

	async findAllGames(_: FastifyRequest, reply: FastifyReply) {
		const games = await this.gameService.getAllGames()

		reply.status(200).send(games)
	}
}
