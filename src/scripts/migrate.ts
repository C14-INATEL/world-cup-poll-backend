import { env } from '@/config/env'
import { createDb } from '@/infrastructure/db'
import { runMigrations } from '@/infrastructure/db/migrations'

async function main() {
	const { db, pool } = createDb(env.DATABASE_URL)

	try {
		await runMigrations(db)
		console.log('Migrations finished successfully')
	} finally {
		await pool.end()
	}
}

main().catch((error) => {
	console.error(error)
	process.exit(1)
})
