import { db } from '@/shared/db'

export type DbExecutor = Pick<typeof db, 'select' | 'insert' | 'update' | 'delete'>

export class UnitOfWork {
	async execute<T>(callback: (trx: DbExecutor) => Promise<T>) {
		return db.transaction(async (trx) => callback(trx as DbExecutor))
	}
}
