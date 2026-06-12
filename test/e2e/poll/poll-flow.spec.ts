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
	makeRequest,
	setupE2E,
	teardownE2E,
} from '../helpers/setup-e2e'
import { truncateTables } from '../../integration/helpers/truncate-tables'

describe('E2E - Poll Flow', () => {
	let setup: E2ETestSetup
	let db: AppDb
	let ownerToken: string
	let participantToken: string

	beforeAll(async () => {
		setup = await setupE2E()
		db = setup.db
	}, 120_000)

	beforeEach(async () => {
		// Register and login owner
		const ownerRegister = await makeRequest(setup.app, {
			method: 'POST',
			url: '/auth/register',
			payload: {
				email: 'owner@test.com',
				password: 'password123',
				name: 'Poll Owner',
			},
		})
		ownerToken = (
			ownerRegister.body.session as { sessionToken: string }
		).sessionToken

		// Register and login participant
		const participantRegister = await makeRequest(setup.app, {
			method: 'POST',
			url: '/auth/register',
			payload: {
				email: 'participant@test.com',
				password: 'password123',
				name: 'Poll Participant',
			},
		})
		participantToken = (
			participantRegister.body.session as { sessionToken: string }
		).sessionToken
	})

	afterEach(async () => {
		await truncateTables(db)
	})

	afterAll(async () => {
		await teardownE2E(setup)
	})

	it('should create a poll successfully', async () => {
		const response = await makeRequest(setup.app, {
			method: 'POST',
			url: '/poll',
			payload: {
				title: 'World Cup 2026 Predictions',
				code: 'WC2026POLL',
			},
			headers: {
				authorization: `Bearer ${ownerToken}`,
			},
		})

		expect(response.statusCode).toBe(201)
		expect(response.body).toEqual(
			expect.objectContaining({
				id: expect.any(String),
				title: 'World Cup 2026 Predictions',
				code: 'WC2026POLL',
			})
		)
	})

	it('should not allow duplicate poll codes', async () => {
		// Create first poll
		await makeRequest(setup.app, {
			method: 'POST',
			url: '/poll',
			payload: {
				title: 'First Poll',
				code: 'DUPLICATE123',
			},
			headers: {
				authorization: `Bearer ${ownerToken}`,
			},
		})

		// Try to create second poll with same code
		const response = await makeRequest(setup.app, {
			method: 'POST',
			url: '/poll',
			payload: {
				title: 'Second Poll',
				code: 'DUPLICATE123',
			},
			headers: {
				authorization: `Bearer ${ownerToken}`,
			},
		})

		expect(response.statusCode).toBe(400)
	})

	it('should list user polls', async () => {
		// Create multiple polls
		await makeRequest(setup.app, {
			method: 'POST',
			url: '/poll',
			payload: {
				title: 'Poll 1',
				code: 'POLL001',
			},
			headers: {
				authorization: `Bearer ${ownerToken}`,
			},
		})

		await makeRequest(setup.app, {
			method: 'POST',
			url: '/poll',
			payload: {
				title: 'Poll 2',
				code: 'POLL002',
			},
			headers: {
				authorization: `Bearer ${ownerToken}`,
			},
		})

		// List polls
		const response = await makeRequest(setup.app, {
			method: 'GET',
			url: '/poll',
			headers: {
				authorization: `Bearer ${ownerToken}`,
			},
		})

		expect(response.statusCode).toBe(200)
		expect(Array.isArray(response.body.polls)).toBe(true)
		expect((response.body.polls as Array<Record<string, unknown>>).length).toBe(2)
	})

	it('should delete a poll only by owner', async () => {
		// Owner creates poll
		const createResponse = await makeRequest(setup.app, {
			method: 'POST',
			url: '/poll',
			payload: {
				title: 'Poll to Delete',
				code: 'DELETE001',
			},
			headers: {
				authorization: `Bearer ${ownerToken}`,
			},
		})

		const pollId = (createResponse.body as { id: string }).id

		// Participant tries to delete - should fail
		const deleteAttempt = await makeRequest(setup.app, {
			method: 'DELETE',
			url: `/poll/${pollId}`,
			headers: {
				authorization: `Bearer ${participantToken}`,
			},
		})

		expect(deleteAttempt.statusCode).toBe(403)

		// Owner deletes - should succeed
		const ownerDelete = await makeRequest(setup.app, {
			method: 'DELETE',
			url: `/poll/${pollId}`,
			headers: {
				authorization: `Bearer ${ownerToken}`,
			},
		})

		expect(ownerDelete.statusCode).toBe(200)

		// Verify poll is deleted
		const getResponse = await makeRequest(setup.app, {
			method: 'GET',
			url: `/poll/${pollId}`,
			headers: {
				authorization: `Bearer ${ownerToken}`,
			},
		})

		expect(getResponse.statusCode).toBe(404)
	})
})
