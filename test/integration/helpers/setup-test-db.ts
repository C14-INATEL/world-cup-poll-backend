import {
	PostgreSqlContainer,
	StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { Pool } from 'pg'
import { AppDb, createDb } from '@/infrastructure/db'
import { runMigrations } from '@/infrastructure/db/migrate'

export let postgresContainer: StartedPostgreSqlContainer
let testDb: AppDb
let testPoll: Pool

export async function setupTestDatabase() {
	postgresContainer = await new PostgreSqlContainer('postgres:16.9-alpine3.22')
		.withDatabase('test_db')
		.withUsername('test')
		.withPassword('test')
		.start()

	const databaseUrl = postgresContainer.getConnectionUri()

	if (!databaseUrl) {
		throw new Error(
			'Erro ao obter a URL de conexão do banco de dados. Verifique se o serviço do Docker está em execução',
		)
	}

	const { db, pool } = createDb(databaseUrl)

	await runMigrations(db)

	testDb = db
	testPoll = pool

	return testDb
}

export async function teardownTestDatabase() {
	await testPoll.end()
	await postgresContainer.stop()
}
