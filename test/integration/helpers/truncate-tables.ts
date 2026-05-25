import { sql } from 'drizzle-orm'
import type { AppDb } from '@/infrastructure/db'

export async function truncateTables(appDb: AppDb) {
	await appDb.execute(sql`
		TRUNCATE TABLE
			game,
      guess,
      invite,
      participant,
      poll,
      user_sessions,
      "user"
		RESTART IDENTITY
		CASCADE
  `)
}
