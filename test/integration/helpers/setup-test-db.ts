import {
	PostgreSqlContainer,
	StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { createDb } from '@/infrastructure/db'
import { runMigrations } from '@/infrastructure/db/migrate'

export let postgresContainer: StartedPostgreSqlContainer

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

	return { db, pool }
}

export async function teardownTestDatabase() {
	await postgresContainer.stop()
}
