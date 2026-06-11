CREATE TYPE "public"."inviteStatus" AS ENUM('pending', 'accepted', 'declined');--> statement-breakpoint
CREATE TABLE "game" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"apiId" integer NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"status" text NOT NULL,
	"firstTeamCountryCode" varchar NOT NULL,
	"secondTeamCountryCode" varchar NOT NULL,
	"firstTeamName" text,
	"secondTeamName" text,
	"firstTeamGoals" integer,
	"secondTeamGoals" integer,
	"firstTeamCrestUrl" text,
	"secondTeamCrestUrl" text,
	CONSTRAINT "game_apiId_unique" UNIQUE("apiId")
);
--> statement-breakpoint
CREATE TABLE "guess" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firstTeamPoints" integer NOT NULL,
	"secondTeamPoints" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"gameId" uuid NOT NULL,
	"participantId" uuid NOT NULL,
	CONSTRAINT "guess_participantId_gameId_unique" UNIQUE("participantId","gameId")
);
--> statement-breakpoint
CREATE TABLE "invite" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pollId" uuid NOT NULL,
	"invitedUserId" uuid NOT NULL,
	"invitedBy" uuid NOT NULL,
	"status" "inviteStatus" DEFAULT 'pending' NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pollId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	CONSTRAINT "participant_userId_pollId_unique" UNIQUE("userId","pollId")
);
--> statement-breakpoint
CREATE TABLE "poll" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(127) NOT NULL,
	"code" varchar(10) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"ownerId" uuid NOT NULL,
	CONSTRAINT "poll_code_unique" UNIQUE("code")
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
CREATE TABLE "user_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sessionToken" uuid NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "guess" ADD CONSTRAINT "guess_gameId_game_id_fk" FOREIGN KEY ("gameId") REFERENCES "public"."game"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guess" ADD CONSTRAINT "guess_participantId_participant_id_fk" FOREIGN KEY ("participantId") REFERENCES "public"."participant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite" ADD CONSTRAINT "invite_pollId_poll_id_fk" FOREIGN KEY ("pollId") REFERENCES "public"."poll"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite" ADD CONSTRAINT "invite_invitedUserId_user_id_fk" FOREIGN KEY ("invitedUserId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite" ADD CONSTRAINT "invite_invitedBy_user_id_fk" FOREIGN KEY ("invitedBy") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant" ADD CONSTRAINT "participant_pollId_poll_id_fk" FOREIGN KEY ("pollId") REFERENCES "public"."poll"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant" ADD CONSTRAINT "participant_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll" ADD CONSTRAINT "poll_ownerId_user_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;