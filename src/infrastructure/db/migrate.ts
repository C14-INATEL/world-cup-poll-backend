import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db } from '.'

async function runMigrations() {
	await migrate(db, { migrationsFolder: 'drizzle' })
}

runMigrations()
	.then(() => {
		console.log('Migrations completed successfully.')
		process.exit(0)
	})
	.catch((error) => {
		console.error('Error running migrations:', error)
		process.exit(1)
	})
