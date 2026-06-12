import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	it,
} from 'vitest'
import type { AppDb } from '@/infrastructure/db'
import {
	E2ETestSetup,
	extractCookie,
	makeRequest,
	setupE2E,
	teardownE2E,
} from '../helpers/setup-e2e'
import { truncateTables } from '../../integration/helpers/truncate-tables'

describe('E2E - Auth Flow', () => {
	let setup: E2ETestSetup
	let db: AppDb

	beforeAll(async () => {
		setup = await setupE2E()
		db = setup.db
	}, 120_000)

	afterEach(async () => {
		await truncateTables(db)
	})

	afterAll(async () => {
		await teardownE2E(setup)
	})

	it('should register a new user successfully', async () => {
		const response = await makeRequest(setup.app, {
			method: 'POST',
			url: '/auth/register',
			payload: {
				email: 'newuser@test.com',
				password: 'password123',
				name: 'Test User',
			},
		})

		expect(response.statusCode).toBe(201)
		expect(response.body).toEqual(
			expect.objectContaining({
				user: expect.objectContaining({
					id: expect.any(String),
					email: 'newuser@test.com',
					name: 'Test User',
				}),
				session: expect.objectContaining({
					id: expect.any(String),
					sessionToken: expect.any(String),
				}),
			})
		)
	})

	it('should not register duplicate email', async () => {
		// First registration
		await makeRequest(setup.app, {
			method: 'POST',
			url: '/auth/register',
			payload: {
				email: 'duplicate@test.com',
				password: 'password123',
				name: 'First User',
			},
		})

		// Second registration with same email
		const response = await makeRequest(setup.app, {
			method: 'POST',
			url: '/auth/register',
			payload: {
				email: 'duplicate@test.com',
				password: 'other123',
				name: 'Second User',
			},
		})

		expect(response.statusCode).toBe(409)
	})

	it('should login successfully with valid credentials', async () => {
		// Register user
		const registerResponse = await makeRequest(setup.app, {
			method: 'POST',
			url: '/auth/register',
			payload: {
				email: 'login@test.com',
				password: 'correct123',
				name: 'Login Test',
			},
		})

		const sessionToken = (registerResponse.body.session as { sessionToken: string })
			.sessionToken

		// Logout
		await makeRequest(setup.app, {
			method: 'POST',
			url: '/auth/logout',
			headers: {
				authorization: `Bearer ${sessionToken}`,
			},
		})

		// Login
		const loginResponse = await makeRequest(setup.app, {
			method: 'POST',
			url: '/auth/login',
			payload: {
				email: 'login@test.com',
				password: 'correct123',
			},
		})

		expect(loginResponse.statusCode).toBe(200)
		expect(loginResponse.body).toEqual(
			expect.objectContaining({
				user: expect.objectContaining({
					email: 'login@test.com',
				}),
				session: expect.objectContaining({
					sessionToken: expect.any(String),
				}),
			})
		)
	})

	it('should fail login with incorrect password', async () => {
		// Register user
		await makeRequest(setup.app, {
			method: 'POST',
			url: '/auth/register',
			payload: {
				email: 'wrongpass@test.com',
				password: 'correct123',
				name: 'Wrong Pass Test',
			},
		})

		// Try to login with wrong password
		const response = await makeRequest(setup.app, {
			method: 'POST',
			url: '/auth/login',
			payload: {
				email: 'wrongpass@test.com',
				password: 'wrong123',
			},
		})

		expect(response.statusCode).toBe(401)
	})

	it('should fail login with non-existent user', async () => {
		const response = await makeRequest(setup.app, {
			method: 'POST',
			url: '/auth/login',
			payload: {
				email: 'nonexistent@test.com',
				password: 'anything123',
			},
		})

		expect(response.statusCode).toBe(401)
	})

	it('should logout and invalidate session', async () => {
		// Register
		const registerResponse = await makeRequest(setup.app, {
			method: 'POST',
			url: '/auth/register',
			payload: {
				email: 'logout@test.com',
				password: 'password123',
				name: 'Logout Test',
			},
		})

		const sessionToken = (registerResponse.body.session as { sessionToken: string })
			.sessionToken

		// Logout
		const logoutResponse = await makeRequest(setup.app, {
			method: 'POST',
			url: '/auth/logout',
			headers: {
				authorization: `Bearer ${sessionToken}`,
			},
		})

		expect(logoutResponse.statusCode).toBe(200)

		// Try to use old session - should fail
		const protectedResponse = await makeRequest(setup.app, {
			method: 'GET',
			url: '/user/profile',
			headers: {
				authorization: `Bearer ${sessionToken}`,
			},
		})

		expect(protectedResponse.statusCode).toBe(401)
	})
})
