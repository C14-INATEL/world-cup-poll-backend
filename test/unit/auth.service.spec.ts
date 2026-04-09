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
		test('deve lançar BadRequestError se usuário não existe', async () => {
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

			expect(userService.findUserByEmail).toHaveBeenCalledWith('naoexiste@example.com')
		})

		test('deve lançar BadRequestError se senha está incorreta', async () => {
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

		test('deve retornar usuário e sessão ao fazer login com sucesso', async () => {
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

			const result = await service.login({ email: user.email, password: 'senha-correta' })

			expect(result).toEqual({ user, session })
		})

		test('deve chamar createSession com o ID correto do usuário', async () => {
			const user = makeUser({ id: 'user-42' })
			const session = makeSession({ userId: 'user-42' })

			const userService = { findUserByEmail: vi.fn().mockResolvedValue(user) }
			const sessionService = { createSession: vi.fn().mockResolvedValue(session) }

			vi.mocked(compareHashPassword).mockResolvedValue(true)

			const service = new AuthService(
				userService as any,
				sessionService as any,
				{} as any,
			)

			await service.login({ email: user.email, password: 'senha-correta' })

			expect(sessionService.createSession).toHaveBeenCalledWith('user-42')
		})
	})

	describe('register', () => {
		test('deve criar usuário e sessão ao registrar com sucesso', async () => {
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
			expect(sessionService.createSession).toHaveBeenCalledWith(user.id, expect.anything())
		})
	})

	describe('logout', () => {
		test('deve chamar deleteSession com o token correto', async () => {
			const sessionService = { deleteSession: vi.fn().mockResolvedValue(undefined) }

			const service = new AuthService(
				{} as any,
				sessionService as any,
				{} as any,
			)

			await service.logout('meu-token-de-sessao')

			expect(sessionService.deleteSession).toHaveBeenCalledWith('meu-token-de-sessao')
		})
	})
})
