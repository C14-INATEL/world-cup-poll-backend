import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
	DATABASE_URL: z.string().min(1),
	PORT: z.number().min(1),
	FOOTBALL_API_KEY: z.string().min(1),
	JWT_SECRET: z.string().min(1),
	FRONTEND_URL: z.url().optional(),
})

export const env = envSchema.parse({
	DATABASE_URL: process.env.DATABASE_URL,
	PORT: Number(process.env.PORT),
	FRONTEND_URL: process.env.FRONTEND_URL,
	FOOTBALL_API_KEY: process.env.FOOTBALL_API_KEY,
	JWT_SECRET: process.env.JWT_SECRET,
})
