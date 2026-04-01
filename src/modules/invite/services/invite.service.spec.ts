import { makeInvite } from '@test/factories/invite/make-invite'
import { UnitOfWorkMock } from '@test/mocks/unit-of-work.mock'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { BadRequestError } from '@/shared/errors/error-handler'
import { InMemoryInviteRepository } from '../repositories/in-memory-invite.repository'
import { InviteService } from './invite.service'

describe('InviteService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

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

		test('should set invite expiration to 24 hours ahead', async () => {
			vi.useFakeTimers()
			vi.setSystemTime(new Date('2026-01-15T10:00:00.000Z'))

			const inviteRepository = {
				findExistentInvite: vi.fn().mockResolvedValue(null),
				createInvite: vi.fn().mockImplementation(async (data) => ({
					id: 'invite-1',
					status: 'pending',
					createdAt: new Date(),
					...data,
				})),
			}

			const inviteService = new InviteService(
				inviteRepository as any,
				{} as any,
				{} as any,
			)

			await inviteService.create({
				invitedUserId: 'user-1',
				pollId: 'poll-1',
				invitedBy: 'user-2',
			})

			expect(inviteRepository.createInvite).toHaveBeenCalledOnce()

			const invitePayload = inviteRepository.createInvite.mock.calls[0][0]

			expect(invitePayload.expiresAt.getTime() - Date.now()).toBe(
				24 * 60 * 60 * 1000,
			)
		})
	})

	describe('updateInviteStatus', () => {
		test('should throw when invite does not exist', async () => {
			const inviteRepository = {
				findInviteById: vi.fn().mockResolvedValue(null),
				updateInviteStatus: vi.fn(),
			}

			const participantRepository = {
				add: vi.fn(),
			}

			const inviteService = new InviteService(
				inviteRepository as any,
				participantRepository as any,
				new UnitOfWorkMock(),
			)

			await expect(
				inviteService.updateInviteStatus('invite-1', 'accepted', 'user-1'),
			).rejects.toThrow(BadRequestError)

			expect(inviteRepository.updateInviteStatus).not.toHaveBeenCalled()
			expect(participantRepository.add).not.toHaveBeenCalled()
		})

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

		test('should add participant when invite is accepted', async () => {
			const transaction = { id: 'trx-1' }
			const unitOfWork = {
				execute: vi.fn().mockImplementation(async (fn) => fn(transaction)),
			}

			const inviteRepository = {
				findInviteById: vi.fn().mockResolvedValue(makeInvite()),
				updateInviteStatus: vi
					.fn()
					.mockResolvedValue(makeInvite({ status: 'accepted' })),
			}

			const participantRepository = {
				add: vi.fn().mockResolvedValue({ id: 'participant-1' }),
			}

			const inviteService = new InviteService(
				inviteRepository as any,
				participantRepository as any,
				unitOfWork as any,
			)

			await inviteService.updateInviteStatus('invite-1', 'accepted', 'user-1')

			expect(inviteRepository.findInviteById).toHaveBeenCalledWith(
				'invite-1',
				transaction,
			)
			expect(inviteRepository.updateInviteStatus).toHaveBeenCalledWith(
				'invite-1',
				'accepted',
				transaction,
			)
			expect(participantRepository.add).toHaveBeenCalledWith(
				{
					pollId: 'poll-1',
					userId: 'user-1',
				},
				transaction,
			)
		})

		test('should not add participant when invite is declined', async () => {
			const inviteRepository = {
				findInviteById: vi.fn().mockResolvedValue(makeInvite()),
				updateInviteStatus: vi
					.fn()
					.mockResolvedValue(makeInvite({ status: 'declined' })),
			}

			const participantRepository = {
				add: vi.fn(),
			}

			const inviteService = new InviteService(
				inviteRepository as any,
				participantRepository as any,
				new UnitOfWorkMock(),
			)

			await inviteService.updateInviteStatus('invite-1', 'declined', 'user-1')

			expect(participantRepository.add).not.toHaveBeenCalled()
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
