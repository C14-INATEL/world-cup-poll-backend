import { defineConfig } from 'drizzle-kit'
import { env } from '@/config/env'

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/infrastructure/db/schemas',
	out: './drizzle',
	dbCredentials: {
		url: env.DATABASE_URL,
	},
})
