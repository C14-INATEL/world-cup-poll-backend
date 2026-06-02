import { createRealPollFactory } from '@test/factories/poll/create-real-poll'
import { makePoll } from '@test/factories/poll/make-poll'
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
import { BadRequestError } from '@/core/errors/error-handler'
import { AppDb } from '@/infrastructure/db'
import { UserType } from '@/infrastructure/db/schemas'
import { makePollService } from '@/modules/poll/services/make-poll.service'
import { PollService } from '@/modules/poll/services/poll.service'
import { setupTestDatabase, teardownTestDatabase } from '../helpers/setup-test-db'
import { truncateTables } from '../helpers/truncate-tables'

describe('integration - poll services', () => {
	let testDb: AppDb

	let pollService: PollService
	let user: UserType

	beforeAll(async () => {
		testDb = await setupTestDatabase()
	}, 120_000)

	beforeEach(async () => {
		user = await createRealUserFactory(testDb)
		pollService = makePollService(testDb)
	})

	afterEach(async () => {
		await truncateTables(testDb)
	})

	afterAll(async () => {
		await teardownTestDatabase()
	})

	it('should create a poll successfully', async () => {
		const poll = await pollService.create(
			makePoll({
				code: 'TEST123456',
				title: 'Test Poll',
				ownerId: user.id,
			}),
		)

		expect(poll).toBeDefined()

		const userPolls = await pollService.findAllByUserId(poll.ownerId)

		expect(userPolls).toHaveLength(1)
		expect(userPolls[0].code).toBe('TEST123456')
		expect(userPolls[0].title).toBe('Test Poll')
	})

	it('should not allow creating a poll with duplicate code', async () => {
		const firstPoll = await createRealPollFactory(testDb, {
			code: 'DUPLICATE0',
			title: 'First Poll',
			ownerId: user.id,
		})

		await expect(
			pollService.create({
				code: firstPoll.code,
				title: 'Second Poll',
				ownerId: user.id,
			}),
		).rejects.toThrow(BadRequestError)
	})

	it('should delete a poll successfully', async () => {
		const poll = await createRealPollFactory(testDb, {
			code: 'CODEDELETE',
			title: 'poll to delete',
			ownerId: user.id,
		})

		await pollService.delete(poll.id, poll.ownerId)

		const userPolls = await pollService.findAllByUserId(poll.ownerId)
		expect(userPolls).toHaveLength(0)
	})
})
