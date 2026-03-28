import { defineConfig } from 'drizzle-kit'
import { env } from '@/config'

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/shared/db/schemas',
	out: './drizzle',
	dbCredentials: {
		url: env.DATABASE_URL,
	},
})
