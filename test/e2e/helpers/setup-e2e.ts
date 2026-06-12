import {
	PostgreSqlContainer,
	StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import type { FastifyInstance } from 'fastify'
import { Pool } from 'pg'
import { buildApp } from '@/app'
import { AppDb, createDb } from '@/infrastructure/db'
import { runMigrations } from '@/infrastructure/db/migrations'

export interface E2ETestSetup {
	app: FastifyInstance
	db: AppDb
	container: StartedPostgreSqlContainer
	pool: Pool
}

export async function setupE2E(): Promise<E2ETestSetup> {
	const container = await new PostgreSqlContainer(
		'postgres:16.9-alpine3.22'
	)
		.withDatabase('test_e2e_db')
		.withUsername('test')
		.withPassword('test')
		.start()

	const databaseUrl = container.getConnectionUri()

	if (!databaseUrl) {
		throw new Error(
			'Erro ao obter a URL de conexão do banco de dados. Verifique se o Docker está ativo'
		)
	}

	const { db, pool } = createDb(databaseUrl)

	// Rodar migrations
	await runMigrations(db)

	// Criar app
	const app = buildApp(db)

	return {
		app,
		db,
		container,
		pool,
	}
}

export async function teardownE2E(setup: E2ETestSetup): Promise<void> {
	await setup.app.close()
	await setup.pool.end()
	await setup.container.stop()
}

export interface TestRequest {
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
	url: string
	payload?: Record<string, unknown>
	headers?: Record<string, string>
}

export interface TestResponse {
	statusCode: number
	body: Record<string, unknown>
	headers: Record<string, unknown>
}

export async function makeRequest(
	app: FastifyInstance,
	request: TestRequest
): Promise<TestResponse> {
	const response = await app.inject({
		method: request.method,
		url: request.url,
		payload: request.payload,
		headers: request.headers,
	})

	let body: Record<string, unknown> = {}

	try {
		body = response.json() as Record<string, unknown>
	} catch {
		body = { message: response.body } as Record<string, unknown>
	}

	return {
		statusCode: response.statusCode,
		body,
		headers: response.headers,
	}
}

export function extractCookie(
	response: TestResponse,
	cookieName: string
): string | null {
	const setCookie = response.headers['set-cookie']

	if (!setCookie) return null

	const cookies = Array.isArray(setCookie) ? setCookie : [setCookie]

	for (const cookie of cookies) {
		if (cookie.includes(cookieName)) {
			const match = cookie.match(/session_token=([^;]+)/)
			return match ? match[1] : null
		}
	}

	return null
}
