import logger from '@/config/logger'
import { getAllMatchesFromApiJob } from '@/infrastructure/jobs/get-games.job'

async function main() {
	logger.info('[SEED] Starting games seed by calling getAllMatchesFromApiJob')

	try {
		await getAllMatchesFromApiJob()
		logger.info('[SEED] Games seed finished successfully')
	} catch (error) {
		logger.error({
			message: '[SEED] Games seed failed',
			error: (error as Error).message,
			stack: (error as Error).stack,
		})
		process.exitCode = 1
	}
}

void main()
