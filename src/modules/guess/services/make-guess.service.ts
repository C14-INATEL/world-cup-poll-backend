import type { AppDb } from '@/infrastructure/db'
import { GameRepository } from '@/modules/game/repositories/game.repository'
import { GuessRepository } from '@/modules/guess/repositories/guess.repository'
import { ParticipantRepository } from '@/modules/participant/repositories/participant.repository'
import { GuessService } from './guess.service'

export function makeGuessService(db: AppDb) {
	const guessRepository = new GuessRepository(db)
	const gameRepository = new GameRepository(db)
	const participantRepository = new ParticipantRepository(db)

	return new GuessService(guessRepository, gameRepository, participantRepository)
}
