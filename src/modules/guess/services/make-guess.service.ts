import { GameRepository } from '@/modules/game/repositories/game.repository'
import { GuessRepository } from '@/modules/guess/repositories/guess.repository'
import { ParticipantRepository } from '@/modules/participant/repositories/participant.repository'
import { GuessService } from './guess.service'

export function makeGuessService() {
	const guessRepository = new GuessRepository()
	const gameRepository = new GameRepository()
	const participantRepository = new ParticipantRepository()

	return new GuessService(guessRepository, gameRepository, participantRepository)
}
