import { defineConfig } from 'drizzle-kit'
import { env } from '@/utils/env'

export default defineConfig({
	dialect: 'postgresql',
	schema: '@/db/schema',
	out: './drizzle',
	dbCredentials: {
		url: env.DATABASE_URL,
	},
})
