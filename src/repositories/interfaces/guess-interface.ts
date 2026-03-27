import { Guess, GuessInsert } from '@/db/schemas'

export interface GuessRepositoryInterface {
	findAll(): Promise<Guess[]>
	findAllByGameId(gameId: string): Promise<Guess[]>
	findById(id: string): Promise<Guess | null>
	findByParticipantId(participantId: string): Promise<Guess[]>
	findByParticipantAndGame(gameId: string, participantId: string): Promise<Guess>
	create(data: GuessInsert): Promise<Guess>
	update(data: { id: string; guess: Partial<GuessInsert> }): Promise<Guess>
}
