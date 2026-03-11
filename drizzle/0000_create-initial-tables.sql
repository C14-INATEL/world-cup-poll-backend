CREATE TABLE "game" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp NOT NULL,
	"firstTeamCountryCode" varchar NOT NULL,
	"secondTeamCountryCode" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guess" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firstTeamPoints" integer NOT NULL,
	"secondTeamPoints" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"gameId" uuid NOT NULL,
	"participantId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pollId" uuid NOT NULL,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poll" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(127) NOT NULL,
	"code" varchar(10) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"ownerId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"passwordHash" varchar(255) NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "guess" ADD CONSTRAINT "guess_gameId_game_id_fk" FOREIGN KEY ("gameId") REFERENCES "public"."game"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant" ADD CONSTRAINT "participant_pollId_poll_id_fk" FOREIGN KEY ("pollId") REFERENCES "public"."poll"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant" ADD CONSTRAINT "participant_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll" ADD CONSTRAINT "poll_ownerId_user_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;