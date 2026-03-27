import { GameRepository } from '@/repositories/game-repository'
import { GuessRepository } from '@/repositories/guess-repository'
import { ParticipantRepository } from '@/repositories/participant-repository'
import { GuessService } from '../guess.service'

export function makeGuessService() {
	const guessRepository = new GuessRepository()
	const gameRepository = new GameRepository()
	const participantRepository = new ParticipantRepository()

	return new GuessService(guessRepository, gameRepository, participantRepository)
}
