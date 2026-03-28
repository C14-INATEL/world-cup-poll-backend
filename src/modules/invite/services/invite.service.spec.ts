import { makeInvite } from '@test/factories/invite/make-invite'
import { UnitOfWorkMock } from '@test/mocks/unit-of-work.mock'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { BadRequestError } from '@/shared/errors/error-handler'
import { InMemoryInviteRepository } from '../repositories/in-memory-invite.repository'
import { InviteService } from './invite.service'

describe('InviteService', () => {
	describe('create', () => {
		test('should not allow duplicate invites', async () => {
			const repo = new InMemoryInviteRepository()

			const service = new InviteService(repo as any, {} as any, {} as any)

			await service.create({
				invitedUserId: 'user-1',
				pollId: 'poll-1',
				invitedBy: 'user-2',
			})

			await expect(
				service.create({
					invitedUserId: 'user-1',
					pollId: 'poll-1',
					invitedBy: 'user-2',
				}),
			).rejects.toThrow(BadRequestError)
		})
	})

	describe('updateInviteStatus', () => {
		test('should not accept expired invites', async () => {
			const inviteRepository = {
				findInviteById: vi
					.fn()
					.mockResolvedValue(makeInvite({ expiresAt: new Date(Date.now() - 1000) })),
				updateInviteStatus: vi.fn(),
			}

			const inviteService = new InviteService(
				inviteRepository as any,
				{} as any,
				new UnitOfWorkMock(),
			)

			await expect(
				inviteService.updateInviteStatus('invite-1', 'accepted', 'user-1'),
			).rejects.toThrow(BadRequestError)

			expect(inviteRepository.updateInviteStatus).not.toHaveBeenCalled()
		})

		test('should not allow responding to already responded invites', async () => {
			const inviteRepository = {
				findInviteById: vi
					.fn()
					.mockResolvedValue(makeInvite({ status: 'accepted' })),
				updateInviteStatus: vi.fn(),
			}

			const inviteService = new InviteService(
				inviteRepository as any,
				{} as any,
				new UnitOfWorkMock(),
			)

			await expect(
				inviteService.updateInviteStatus('invite-1', 'declined', 'user-1'),
			).rejects.toThrow(BadRequestError)

			expect(inviteRepository.updateInviteStatus).not.toHaveBeenCalled()
		})

		test('should throw when a different user tries to respond to the invite', async () => {
			const inviteRepository = {
				findInviteById: vi.fn().mockResolvedValue(makeInvite),
				updateInviteStatus: vi.fn(),
			}

			const inviteService = new InviteService(
				inviteRepository as any,
				{} as any,
				new UnitOfWorkMock(),
			)

			await expect(
				inviteService.updateInviteStatus('invite-1', 'accepted', 'user-3'),
			).rejects.toThrow(BadRequestError)

			expect(inviteRepository.updateInviteStatus).not.toHaveBeenCalled()
		})
	})
})
