import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { UnauthorizedError } from '@/core/errors/error-handler'
import { SessionService } from '@/modules/session/services/session.service'
import { makeSession } from '../factories/session/make-session'

describe('SessionService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	describe('validateSession', () => {
		test('deve lançar UnauthorizedError se sessão não existe', async () => {
			const sessionRepository = { findByToken: vi.fn().mockResolvedValue(null) }

			const service = new SessionService(sessionRepository as any)

			await expect(service.validateSession('token-invalido')).rejects.toThrow(
				UnauthorizedError,
			)
		})

		test('deve lançar UnauthorizedError se sessão está expirada', async () => {
			const expiredSession = makeSession({
				expiresAt: new Date('2020-01-01T00:00:00.000Z'),
			})
			const sessionRepository = {
				findByToken: vi.fn().mockResolvedValue(expiredSession),
			}

			const service = new SessionService(sessionRepository as any)

			await expect(service.validateSession('token-expirado')).rejects.toThrow(
				UnauthorizedError,
			)
		})

		test('deve retornar sessão válida', async () => {
			const session = makeSession({
				expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
			})
			const sessionRepository = {
				findByToken: vi.fn().mockResolvedValue(session),
			}

			const service = new SessionService(sessionRepository as any)

			const result = await service.validateSession('token-valido')

			expect(result).toEqual(session)
		})
	})

	describe('createSession', () => {
		test('deve chamar sessionRepository.create com userId e expiração de 7 dias', async () => {
			vi.useFakeTimers()
			const now = new Date('2026-04-09T12:00:00.000Z')
			vi.setSystemTime(now)

			const expectedExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
			const session = makeSession({ userId: 'user-1' })

			const sessionRepository = { create: vi.fn().mockResolvedValue(session) }

			const service = new SessionService(sessionRepository as any)

			await service.createSession('user-1')

			expect(sessionRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: 'user-1',
					expiresAt: expectedExpiresAt,
				}),
				undefined,
			)
		})
	})

	describe('deleteSession', () => {
		test('deve chamar sessionRepository.delete com o token correto', async () => {
			const sessionRepository = { delete: vi.fn().mockResolvedValue(undefined) }

			const service = new SessionService(sessionRepository as any)

			await service.deleteSession('meu-token')

			expect(sessionRepository.delete).toHaveBeenCalledWith('meu-token', undefined)
		})
	})
})
