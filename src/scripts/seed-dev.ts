import { sql } from 'drizzle-orm'
import { env } from '@/config/env'
import logger from '@/config/logger'
import { hashPassword } from '@/core/utils/password'
import { createDb } from '@/infrastructure/db'
import {
	gameTable,
	guessTable,
	participantTable,
	pollTable,
	userTable,
} from '@/infrastructure/db/schemas'

function addDays(days: number) {
	const date = new Date()
	date.setDate(date.getDate() + days)
	date.setHours(16, 0, 0, 0)
	return date.toISOString()
}

async function main() {
	const { db, pool } = createDb(env.DATABASE_URL)

	try {
		logger.info('[SEED:DEV] Cleaning database')
		await db.execute(
			sql`TRUNCATE TABLE "user_sessions", "invite", "guess", "participant", "poll", "user", "game" RESTART IDENTITY CASCADE`,
		)

		const passwordHash = await hashPassword('123456')

		const [ana, bruno, carla, diego] = await db
			.insert(userTable)
			.values([
				{
					name: 'Ana Silva',
					email: 'ana@teste.com',
					passwordHash,
				},
				{
					name: 'Bruno Costa',
					email: 'bruno@teste.com',
					passwordHash,
				},
				{
					name: 'Carla Souza',
					email: 'carla@teste.com',
					passwordHash,
				},
				{
					name: 'Diego Lima',
					email: 'diego@teste.com',
					passwordHash,
				},
			])
			.returning()

		const [poll] = await db
			.insert(pollTable)
			.values({
				title: 'Bolao da Copa - Teste UI',
				code: 'GRUPO26',
				ownerId: ana.id,
			})
			.returning()

		const participants = await db
			.insert(participantTable)
			.values([
				{ pollId: poll.id, userId: ana.id },
				{ pollId: poll.id, userId: bruno.id },
				{ pollId: poll.id, userId: carla.id },
				{ pollId: poll.id, userId: diego.id },
			])
			.returning()

		const participantByUserId = new Map(
			participants.map((participant) => [participant.userId, participant]),
		)

		const [
			brazilSerbia,
			argentinaGermany,
			portugalSpain,
			franceEngland,
			netherlandsMorocco,
			japanUsa,
		] = await db
			.insert(gameTable)
			.values([
				{
					apiId: 900001,
					date: addDays(-2),
					status: 'FINISHED',
					firstTeamCountryCode: 'BRA',
					secondTeamCountryCode: 'SRB',
					firstTeamName: 'Brasil',
					secondTeamName: 'Servia',
					firstTeamGoals: 2,
					secondTeamGoals: 1,
				},
				{
					apiId: 900002,
					date: addDays(-1),
					status: 'FINISHED',
					firstTeamCountryCode: 'ARG',
					secondTeamCountryCode: 'GER',
					firstTeamName: 'Argentina',
					secondTeamName: 'Alemanha',
					firstTeamGoals: 1,
					secondTeamGoals: 1,
				},
				{
					apiId: 900003,
					date: addDays(1),
					status: 'SCHEDULED',
					firstTeamCountryCode: 'POR',
					secondTeamCountryCode: 'ESP',
					firstTeamName: 'Portugal',
					secondTeamName: 'Espanha',
				},
				{
					apiId: 900004,
					date: addDays(2),
					status: 'SCHEDULED',
					firstTeamCountryCode: 'FRA',
					secondTeamCountryCode: 'ENG',
					firstTeamName: 'Franca',
					secondTeamName: 'Inglaterra',
				},
				{
					apiId: 900005,
					date: addDays(3),
					status: 'SCHEDULED',
					firstTeamCountryCode: 'NED',
					secondTeamCountryCode: 'MAR',
					firstTeamName: 'Holanda',
					secondTeamName: 'Marrocos',
				},
				{
					apiId: 900006,
					date: addDays(4),
					status: 'SCHEDULED',
					firstTeamCountryCode: 'JPN',
					secondTeamCountryCode: 'USA',
					firstTeamName: 'Japao',
					secondTeamName: 'Estados Unidos',
				},
			])
			.returning()

		const anaParticipant = participantByUserId.get(ana.id)
		const brunoParticipant = participantByUserId.get(bruno.id)
		const carlaParticipant = participantByUserId.get(carla.id)
		const diegoParticipant = participantByUserId.get(diego.id)

		if (
			!anaParticipant ||
			!brunoParticipant ||
			!carlaParticipant ||
			!diegoParticipant
		) {
			throw new Error('Failed to create seed participants')
		}

		await db.insert(guessTable).values([
			{
				participantId: anaParticipant.id,
				gameId: brazilSerbia.id,
				firstTeamPoints: 2,
				secondTeamPoints: 1,
			},
			{
				participantId: anaParticipant.id,
				gameId: argentinaGermany.id,
				firstTeamPoints: 1,
				secondTeamPoints: 1,
			},
			{
				participantId: brunoParticipant.id,
				gameId: brazilSerbia.id,
				firstTeamPoints: 1,
				secondTeamPoints: 0,
			},
			{
				participantId: brunoParticipant.id,
				gameId: argentinaGermany.id,
				firstTeamPoints: 2,
				secondTeamPoints: 2,
			},
			{
				participantId: carlaParticipant.id,
				gameId: brazilSerbia.id,
				firstTeamPoints: 2,
				secondTeamPoints: 0,
			},
			{
				participantId: carlaParticipant.id,
				gameId: argentinaGermany.id,
				firstTeamPoints: 1,
				secondTeamPoints: 0,
			},
			{
				participantId: diegoParticipant.id,
				gameId: brazilSerbia.id,
				firstTeamPoints: 0,
				secondTeamPoints: 2,
			},
			{
				participantId: diegoParticipant.id,
				gameId: argentinaGermany.id,
				firstTeamPoints: 0,
				secondTeamPoints: 1,
			},
			{
				participantId: anaParticipant.id,
				gameId: portugalSpain.id,
				firstTeamPoints: 2,
				secondTeamPoints: 1,
			},
			{
				participantId: anaParticipant.id,
				gameId: franceEngland.id,
				firstTeamPoints: 1,
				secondTeamPoints: 1,
			},
			{
				participantId: brunoParticipant.id,
				gameId: portugalSpain.id,
				firstTeamPoints: 1,
				secondTeamPoints: 2,
			},
			{
				participantId: brunoParticipant.id,
				gameId: netherlandsMorocco.id,
				firstTeamPoints: 2,
				secondTeamPoints: 0,
			},
			{
				participantId: carlaParticipant.id,
				gameId: portugalSpain.id,
				firstTeamPoints: 3,
				secondTeamPoints: 2,
			},
			{
				participantId: carlaParticipant.id,
				gameId: franceEngland.id,
				firstTeamPoints: 0,
				secondTeamPoints: 1,
			},
		])

		logger.info({
			message: '[SEED:DEV] Database populated',
			login: 'ana@teste.com',
			password: '123456',
			pollCode: poll.code,
		})
	} catch (error) {
		logger.error({
			message: '[SEED:DEV] Failed',
			error: (error as Error).message,
			stack: (error as Error).stack,
		})
		process.exitCode = 1
	} finally {
		await pool.end()
	}
}

void main()
