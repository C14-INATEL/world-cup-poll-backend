ALTER TABLE "guess" ADD CONSTRAINT "guess_participantId_participant_id_fk" FOREIGN KEY ("participantId") REFERENCES "public"."participant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guess" ADD CONSTRAINT "guess_participantId_gameId_unique" UNIQUE("participantId","gameId");--> statement-breakpoint
ALTER TABLE "participant" ADD CONSTRAINT "participant_userId_pollId_unique" UNIQUE("userId","pollId");--> statement-breakpoint
ALTER TABLE "poll" ADD CONSTRAINT "poll_code_unique" UNIQUE("code");