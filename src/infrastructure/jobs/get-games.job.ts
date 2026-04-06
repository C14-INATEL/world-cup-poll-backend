import { env } from '@/config/env'
import logger from '@/logger'
import { makeGameService } from '@/modules/game/services/make-game.service'
import { GameInsert } from '../db/schemas'

type MatchesApiResponse = {
	id: number
	utcDate: Date
	status: string
	matchday: number
	stage: string
	group: string
	homeTeam: {
		id: number
		name: string
		shortName: string
		tla: string
		crest: string
	}
	awayTeam: {
		id: number | null
		name: string | null
		shortName: string | null
		tla: string | null
		crest: string | null
	}
	score: {
		winner: string | null
		duration: string
		fullTime: {
			home: string | null
			away: string | null
		}
		halfTime: {
			home: string | null
			away: string | null
		}
	}
}

export async function getAllMatchesFromApiJob() {
	logger.info('[CRON] Getting all matches from API...')

	const res = await fetch(
		'https://api.football-data.org/v4/competitions/WC/matches',
		{
			headers: {
				'X-Auth-Token': env.FOOTBALL_API_KEY,
			},
		},
	)

	if (!res.ok) {
		return logger.error({
			message: `[CRON] Failed to fetch matches from API: ${res.status} ${res.statusText}`,
			stack: new Error().stack,
			status: res.status,
			url: res.url,
			method: 'GET',
		})
	}

	const data: { matches: MatchesApiResponse[] } = await res.json()

	const gameService = makeGameService()

	const existingGames = await gameService.getAllGames()

	let updatedGamesCount = 0

	for (const match of data.matches) {
		const game: GameInsert = {
			apiId: match.id,
			date: match.utcDate,
			firstTeamCountryCode: match.homeTeam.tla,
			secondTeamCountryCode: match.awayTeam.tla || '',
			firstTeamGoals: match.score.fullTime.home
				? parseInt(match.score.fullTime.home)
				: null,
			secondTeamGoals: match.score.fullTime.away
				? parseInt(match.score.fullTime.away)
				: null,
			firstTeamName: match.homeTeam.name,
			secondTeamName: match.awayTeam.name,
			firstTeamCrestUrl: match.homeTeam.crest,
			secondTeamCrestUrl: match.awayTeam.crest,
			status: match.status,
		}

		try {
			await gameService.upsertGame({ apiId: game.apiId, game })
		} catch (error) {
			logger.error({
				message: `[CRON] Failed to upsert game with API ID ${game.apiId}: ${(error as Error).message}`,
				stack: (error as Error).stack,
			})
			continue
		}
		updatedGamesCount++
	}

	const gamesAfterUpdate = await gameService.getAllGames()

	logger.info({
		message: '[CRON] Finished updating matches from API.',
		processedMatches: data.matches.length,
		upsertedMatches: updatedGamesCount,
		existingBeforeUpdate: existingGames.length,
		existingAfterUpdate: gamesAfterUpdate.length,
	})
}
