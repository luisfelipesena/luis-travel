CREATE TYPE "public"."participant_status" AS ENUM('pending', 'confirmed', 'declined');--> statement-breakpoint
CREATE TABLE "activity_participant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"activity_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "participant_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "location_lat" text;--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "location_lng" text;--> statement-breakpoint
ALTER TABLE "activity_participant" ADD CONSTRAINT "activity_participant_activity_id_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activity"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_participant" ADD CONSTRAINT "activity_participant_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;