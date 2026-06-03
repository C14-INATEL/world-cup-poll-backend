import { Pool } from 'pg'
import { env } from '@/config/env'
import logger from '@/config/logger'
import { createDb } from '@/infrastructure/db'
import { getAllMatchesFromApiJob } from '@/infrastructure/jobs/get-games.job'

async function main() {
	let dbPool: Pool | null = null

	logger.info('[SEED] Starting games seed by calling getAllMatchesFromApiJob')

	try {
		const { db, pool } = createDb(env.DATABASE_URL)
		dbPool = pool
		await getAllMatchesFromApiJob(db)
		logger.info('[SEED] Games seed finished successfully')
	} catch (error) {
		logger.error({
			message: '[SEED] Games seed failed',
			error: (error as Error).message,
			stack: (error as Error).stack,
		})
		process.exit(1)
	} finally {
		if (dbPool) {
			await dbPool.end()
		}
	}
}

void main()
