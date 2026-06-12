import { Pool } from "pg";
import { env } from "@/config/env";
import logger from "@/config/logger";
import { createDb } from "@/infrastructure/db";
import { getAllMatchesFromApiJob } from "@/infrastructure/jobs/get-games.job";

async function main() {
  let dbPool: Pool | null = null;

  logger.info("[GAMES] Starting games update by calling getAllMatchesFromApiJob");

  try {
    const { db, pool } = createDb(env.DATABASE_URL);
    dbPool = pool;
    await getAllMatchesFromApiJob(db);
    logger.info("[GAMES] Games update finished successfully");
  } catch (error) {
    logger.error({
      message: "[GAMES] Games update failed",
      error: (error as Error).message,
      stack: (error as Error).stack,
    });
    process.exit(1);
  } finally {
    if (dbPool) {
      await dbPool.end();
    }
  }
}

main().catch((error) => {
  logger.error({
    message: "[GAMES] Games update failed (unhandled)",
    error: (error as Error).message,
    stack: (error as Error).stack,
  });
  process.exit(1);
});

