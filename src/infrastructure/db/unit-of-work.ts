import type { AppDb } from '@/infrastructure/db'

export type DbExecutor = Pick<AppDb, 'select' | 'insert' | 'update' | 'delete'>

export interface UnitOfWorkLike {
	execute<T>(callback: (trx: DbExecutor) => Promise<T>): Promise<T>
}

export class UnitOfWork implements UnitOfWorkLike {
	constructor(private readonly db: AppDb) {}

	async execute<T>(callback: (trx: DbExecutor) => Promise<T>) {
		return this.db.transaction(async (trx) => callback(trx as DbExecutor))
	}
}
