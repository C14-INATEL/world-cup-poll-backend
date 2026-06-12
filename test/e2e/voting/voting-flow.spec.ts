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

describe('E2E - Voting Flow (Complete Journey)', () => {
	let setup: E2ETestSetup
	let db: AppDb
	let ownerToken: string
	let player1Token: string
	let player2Token: string
	let pollId: string

	beforeAll(async () => {
		setup = await setupE2E()
		db = setup.db
	}, 120_000)

	beforeEach(async () => {
		// Register poll owner
		const ownerReg = await makeRequest(setup.app, {
			method: 'POST',
			url: '/auth/register',
			payload: {
				email: 'owner@voting.com',
				password: 'password123',
				name: 'Poll Owner',
			},
		})
		ownerToken = (ownerReg.body.session as { sessionToken: string })
			.sessionToken

		// Register player 1
		const player1Reg = await makeRequest(setup.app, {
			method: 'POST',
			url: '/auth/register',
			payload: {
				email: 'player1@voting.com',
				password: 'password123',
				name: 'Player One',
			},
		})
		player1Token = (player1Reg.body.session as { sessionToken: string })
			.sessionToken

		// Register player 2
		const player2Reg = await makeRequest(setup.app, {
			method: 'POST',
			url: '/auth/register',
			payload: {
				email: 'player2@voting.com',
				password: 'password123',
				name: 'Player Two',
			},
		})
		player2Token = (player2Reg.body.session as { sessionToken: string })
			.sessionToken

		// Owner creates poll
		const pollResponse = await makeRequest(setup.app, {
			method: 'POST',
			url: '/poll',
			payload: {
				title: 'Voting Test Poll',
				code: 'VOTINGTEST2026',
			},
			headers: {
				authorization: `Bearer ${ownerToken}`,
			},
		})

		pollId = (pollResponse.body as { id: string }).id
	})

	afterEach(async () => {
		await truncateTables(db)
	})

	afterAll(async () => {
		await teardownE2E(setup)
	})

	it('should complete full voting journey: create -> invite -> join -> vote -> rank', async () => {
		// Step 1: Owner creates invite for player 1
		const inviteResponse = await makeRequest(setup.app, {
			method: 'POST',
			url: `/poll/${pollId}/invite`,
			payload: {
				email: 'player1@voting.com',
			},
			headers: {
				authorization: `Bearer ${ownerToken}`,
			},
		})

		expect(inviteResponse.statusCode).toBe(201)
		const inviteCode = (
			inviteResponse.body as { code: string }
		).code

		// Step 2: Player 1 joins via invite
		const joinResponse = await makeRequest(setup.app, {
			method: 'POST',
			url: `/invite/${inviteCode}/join`,
			payload: {},
			headers: {
				authorization: `Bearer ${player1Token}`,
			},
		})

		expect(joinResponse.statusCode).toBe(200)

		// Step 3: Owner makes a guess (score prediction)
		const ownerGuessResponse = await makeRequest(setup.app, {
			method: 'POST',
			url: `/guess`,
			payload: {
				pollId: pollId,
				gameId: 1, // Assuming game 1 exists or is seeded
				homeTeamScore: 2,
				awayTeamScore: 1,
			},
			headers: {
				authorization: `Bearer ${ownerToken}`,
			},
		})

		expect(ownerGuessResponse.statusCode).toBe(201)

		// Step 4: Player 1 makes a guess
		const player1GuessResponse = await makeRequest(setup.app, {
			method: 'POST',
			url: `/guess`,
			payload: {
				pollId: pollId,
				gameId: 1,
				homeTeamScore: 1,
				awayTeamScore: 1,
			},
			headers: {
				authorization: `Bearer ${player1Token}`,
			},
		})

		expect(player1GuessResponse.statusCode).toBe(201)

		// Step 5: Check poll ranking (should show scores)
		const rankingResponse = await makeRequest(setup.app, {
			method: 'GET',
			url: `/ranking?pollId=${pollId}`,
			headers: {
				authorization: `Bearer ${ownerToken}`,
			},
		})

		expect(rankingResponse.statusCode).toBe(200)
		expect(Array.isArray(rankingResponse.body.ranking)).toBe(true)
	})

	it('should not allow non-invited users to join poll', async () => {
		// Player 2 tries to join without invite
		const joinAttempt = await makeRequest(setup.app, {
			method: 'POST',
			url: `/poll/${pollId}/join`,
			payload: {
				code: 'VOTINGTEST2026',
			},
			headers: {
				authorization: `Bearer ${player2Token}`,
			},
		})

		expect(
			[400, 403, 404].includes(joinAttempt.statusCode)
		).toBe(true)
	})

	it('should prevent duplicate guesses for same game', async () => {
		// Owner makes first guess
		const firstGuess = await makeRequest(setup.app, {
			method: 'POST',
			url: `/guess`,
			payload: {
				pollId: pollId,
				gameId: 1,
				homeTeamScore: 2,
				awayTeamScore: 1,
			},
			headers: {
				authorization: `Bearer ${ownerToken}`,
			},
		})

		expect(firstGuess.statusCode).toBe(201)

		// Try to make second guess for same game
		const secondGuess = await makeRequest(setup.app, {
			method: 'POST',
			url: `/guess`,
			payload: {
				pollId: pollId,
				gameId: 1,
				homeTeamScore: 3,
				awayTeamScore: 0,
			},
			headers: {
				authorization: `Bearer ${ownerToken}`,
			},
		})

		expect([400, 409].includes(secondGuess.statusCode)).toBe(true)
	})

	it('should list poll participants', async () => {
		// Invite and join player 1
		const inviteResponse = await makeRequest(setup.app, {
			method: 'POST',
			url: `/poll/${pollId}/invite`,
			payload: {
				email: 'player1@voting.com',
			},
			headers: {
				authorization: `Bearer ${ownerToken}`,
			},
		})

		const inviteCode = (
			inviteResponse.body as { code: string }
		).code

		await makeRequest(setup.app, {
			method: 'POST',
			url: `/invite/${inviteCode}/join`,
			payload: {},
			headers: {
				authorization: `Bearer ${player1Token}`,
			},
		})

		// Get poll participants
		const participantsResponse = await makeRequest(setup.app, {
			method: 'GET',
			url: `/poll/${pollId}/participants`,
			headers: {
				authorization: `Bearer ${ownerToken}`,
			},
		})

		expect(participantsResponse.statusCode).toBe(200)
		expect(Array.isArray(participantsResponse.body.participants)).toBe(true)
		expect(
			(participantsResponse.body.participants as Array<unknown>).length
		).toBeGreaterThanOrEqual(2)
	})
})
