import { beforeEach, describe, expect, test, vi } from 'vitest'
import { BadRequestError } from '@/core/errors/error-handler'
import { AuthService } from '@/modules/auth/services/auth.service'
import { makeSession } from '../factories/session/make-session'
import { makeUser } from '../factories/user/make-user'
import { UnitOfWorkMock } from '../mocks/unit-of-work.mock'

vi.mock('@/core/utils/password', () => ({
	compareHashPassword: vi.fn(),
}))

import { compareHashPassword } from '@/core/utils/password'

describe('AuthService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('login', () => {
		test('should throw BadRequestError if user does not exist', async () => {
			const userService = { findUserByEmail: vi.fn().mockResolvedValue(null) }
			const sessionService = { createSession: vi.fn() }

			const service = new AuthService(
				userService as any,
				sessionService as any,
				{} as any,
			)

			await expect(
				service.login({ email: 'naoexiste@example.com', password: '123456' }),
			).rejects.toThrow(BadRequestError)

			expect(userService.findUserByEmail).toHaveBeenCalledWith(
				'naoexiste@example.com',
			)
		})

		test('should throw BadRequestError if password is incorrect', async () => {
			const user = makeUser()
			const userService = { findUserByEmail: vi.fn().mockResolvedValue(user) }
			const sessionService = { createSession: vi.fn() }

			vi.mocked(compareHashPassword).mockResolvedValue(false)

			const service = new AuthService(
				userService as any,
				sessionService as any,
				{} as any,
			)

			await expect(
				service.login({ email: user.email, password: 'senha-errada' }),
			).rejects.toThrow(BadRequestError)
		})

		test('should return user and session on successful login', async () => {
			const user = makeUser()
			const session = makeSession({ userId: user.id })

			const userService = { findUserByEmail: vi.fn().mockResolvedValue(user) }
			const sessionService = { createSession: vi.fn().mockResolvedValue(session) }

			vi.mocked(compareHashPassword).mockResolvedValue(true)

			const service = new AuthService(
				userService as any,
				sessionService as any,
				{} as any,
			)

			const result = await service.login({
				email: user.email,
				password: 'senha-correta',
			})

			expect(result).toEqual({ user, session })
		})
	})

	describe('register', () => {
		test('should create user and session on successful registration', async () => {
			const user = makeUser()
			const session = makeSession({ userId: user.id })

			const userService = { createUser: vi.fn().mockResolvedValue(user) }
			const sessionService = { createSession: vi.fn().mockResolvedValue(session) }
			const unitOfWork = new UnitOfWorkMock()

			const service = new AuthService(
				userService as any,
				sessionService as any,
				unitOfWork as any,
			)

			const result = await service.register({
				email: user.email,
				password: 'senha123',
				name: user.name,
			})

			expect(result).toEqual({ user, session })
			expect(userService.createUser).toHaveBeenCalledWith(
				{ email: user.email, password: 'senha123', name: user.name },
				expect.anything(),
			)
			expect(sessionService.createSession).toHaveBeenCalledWith(
				user.id,
				expect.anything(),
			)
		})
	})

	describe('logout', () => {
		test('should call deleteSession with the correct token', async () => {
			const sessionService = { deleteSession: vi.fn().mockResolvedValue(undefined) }

			const service = new AuthService({} as any, sessionService as any, {} as any)

			await service.logout('meu-token-de-sessao')

			expect(sessionService.deleteSession).toHaveBeenCalledWith(
				'meu-token-de-sessao',
			)
		})
	})
})
