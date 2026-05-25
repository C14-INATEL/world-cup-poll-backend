import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { type AppDb } from '.'

export async function runMigrations(appDb: AppDb) {
	await migrate(appDb, { migrationsFolder: 'drizzle' })
}
