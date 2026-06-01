import {
	PostgreSqlContainer,
	StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'

export let postgresContainer: StartedPostgreSqlContainer

export async function setupTestDatabase() {
	postgresContainer = await new PostgreSqlContainer('postgres:16.9-alpine3.22')
		.withDatabase('test_db')
		.withUsername('test')
		.withPassword('test')
		.start()

	return postgresContainer.getConnectionUri()
}

export async function teardownTestDatabase() {
	await postgresContainer.stop()
}
