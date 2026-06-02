import { createRealUserFactory } from '@test/factories/user/create-real-user'
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from 'vitest'
import { isUniqueConstraintError } from '@/core/errors/unique-constraint-error'
import { AppDb } from '@/infrastructure/db'
import { AuthService } from '@/modules/auth/services/auth.service'
import { makeAuthService } from '@/modules/auth/services/make-auth.service'
import { makeSessionService } from '@/modules/session/services/make-session.service'
import { SessionService } from '@/modules/session/services/session.service'
import { setupTestDatabase, teardownTestDatabase } from '../helpers/setup-test-db'
import { truncateTables } from '../helpers/truncate-tables'

describe('integration - auth services', () => {
	let testDb: AppDb

	let authService: AuthService
	let sessionService: SessionService

	beforeAll(async () => {
		testDb = await setupTestDatabase()
	}, 120_000)

	beforeEach(async () => {
		authService = makeAuthService(testDb)
		sessionService = makeSessionService(testDb)
	})

	afterEach(async () => {
		await truncateTables(testDb)
	})

	afterAll(async () => {
		await teardownTestDatabase()
	})

	it('should login successfully', async () => {
		const user = await createRealUserFactory(testDb, {
			email: 'john@email.com',
			password: '123456',
		})

		const result = await authService.login({
			email: 'john@email.com',
			password: '123456',
		})

		expect(result.user.id).toBe(user.id)

		expect(result.session).toEqual(
			expect.objectContaining({
				id: expect.any(String),
				userId: user.id,
			}),
		)
	})

	it('should persist session in database', async () => {
		const user = await createRealUserFactory(testDb, {
			email: 'john@email.com',
			password: '123456',
		})

		const result = await authService.login({
			email: 'john@email.com',
			password: '123456',
		})

		const sessionInDb = await sessionService.validateSession(
			result.session.sessionToken,
		)

		expect(sessionInDb).toBeDefined()
		expect(sessionInDb?.userId).toBe(user.id)
	})

	it('should throw when user does not exist', async () => {
		await expect(() =>
			authService.login({
				email: 'missing@email.com',
				password: '123456',
			}),
		).rejects.toThrow('Email ou senha incorretos')
	})

	it('should throw when password is invalid', async () => {
		await createRealUserFactory(testDb, {
			email: 'john@email.com',
			password: 'correct-password',
		})

		await expect(() =>
			authService.login({
				email: 'john@email.com',
				password: 'wrong-password',
			}),
		).rejects.toThrow('Email ou senha incorretos')
	})

	it('should register successfully and persist session', async () => {
		const { user, session } = await authService.register({
			email: 'jane@email.com',
			password: 'abcdef',
			name: 'Jane Doe',
		})

		expect(user.id).toBeDefined()

		const sessionInDb = await sessionService.validateSession(session.sessionToken)

		expect(sessionInDb).toBeDefined()
		expect(sessionInDb?.userId).toBe(user.id)
	})

	it('should throw when registering with duplicate email', async () => {
		await createRealUserFactory(testDb, {
			email: 'duplicate@example.com',
			password: '123456',
		})

		await expect(
			authService.register({
				email: 'duplicate@example.com',
				password: 'abcdef',
				name: 'Duplicate',
			}),
		).rejects.toSatisfy(isUniqueConstraintError)
	})

	it('should logout and invalidate the session', async () => {
		await createRealUserFactory(testDb, {
			email: 'logout@example.com',
			password: '123456',
		})

		const result = await authService.login({
			email: 'logout@example.com',
			password: '123456',
		})

		await authService.logout(result.session.sessionToken)

		await expect(() =>
			sessionService.validateSession(result.session.sessionToken),
		).rejects.toThrow('Usuário não autenticado')
	})
})
