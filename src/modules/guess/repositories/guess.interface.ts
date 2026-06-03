import { Guess, GuessInsert } from '@/infrastructure/db/schemas'

export type UserGuessRow = {
	guessId: string
	guessCreatedAt: Date
	guessFirstTeamPoints: number
	guessSecondTeamPoints: number
	pollId: string
	pollTitle: string
	gameId: string
	gameDate: string
	gameFirstTeamName: string | null
	gameSecondTeamName: string | null
	gameFirstTeamCountryCode: string
	gameSecondTeamCountryCode: string
	gameFirstTeamGoals: number | null
	gameSecondTeamGoals: number | null
}

export type PollGuessRow = UserGuessRow & {
	participantId: string
	participantName: string
}

export interface GuessRepositoryInterface {
	findAll(): Promise<Guess[]>
	findAllByGameId(gameId: string): Promise<Guess[]>
	findById(id: string): Promise<Guess | null>
	findByParticipantId(participantId: string): Promise<Guess[]>
	findByParticipantAndGame(gameId: string, participantId: string): Promise<Guess>
	findByPollIdWithDetails(
		pollId: string,
		excludedUserId: string,
	): Promise<PollGuessRow[]>
	findByUserIdWithDetails(
		userId: string,
		options: { limit: number; offset: number },
	): Promise<{ rows: UserGuessRow[]; total: number }>
	create(data: GuessInsert): Promise<Guess>
	update(data: { id: string; guess: Partial<GuessInsert> }): Promise<Guess>
}
