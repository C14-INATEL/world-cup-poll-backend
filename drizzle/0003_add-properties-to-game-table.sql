ALTER TABLE "game" ADD COLUMN "apiId" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "game" ADD COLUMN "status" text NOT NULL;--> statement-breakpoint
ALTER TABLE "game" ADD COLUMN "firstTeamName" text;--> statement-breakpoint
ALTER TABLE "game" ADD COLUMN "secondTeamName" text;--> statement-breakpoint
ALTER TABLE "game" ADD COLUMN "firstTeamGoals" integer;--> statement-breakpoint
ALTER TABLE "game" ADD COLUMN "secondTeamGoals" integer;--> statement-breakpoint
ALTER TABLE "game" ADD COLUMN "firstTeamCrestUrl" text;--> statement-breakpoint
ALTER TABLE "game" ADD COLUMN "secondTeamCrestUrl" text;--> statement-breakpoint
ALTER TABLE "game" ADD CONSTRAINT "game_apiId_unique" UNIQUE("apiId");