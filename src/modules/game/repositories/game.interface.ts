import { Game, GameInsert } from '@/shared/db/schemas'

export interface GameRepositoryInterface {
	findAll(): Promise<Game[]>
	findById(id: string): Promise<Game | null>
	findByApiId(apiId: number): Promise<Game | null>
	create(data: GameInsert): Promise<Game>
	update(data: { id: string; game: Partial<GameInsert> }): Promise<Game>
	updateByApiId(data: { apiId: number; game: Partial<GameInsert> }): Promise<Game>
}
