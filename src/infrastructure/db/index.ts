import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

export type AppDb = NodePgDatabase

export function createDb(databaseUrl: string) {
	const pool = new Pool({
		connectionString: databaseUrl,
	})

	return {
		pool,
		db: drizzle(pool),
	}
}
