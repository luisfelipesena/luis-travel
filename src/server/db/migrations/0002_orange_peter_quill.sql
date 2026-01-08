ALTER TABLE "activity" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "type" SET DEFAULT 'custom'::text;--> statement-breakpoint
DROP TYPE "public"."activity_type";--> statement-breakpoint
CREATE TYPE "public"."activity_type" AS ENUM('flight', 'accommodation', 'transport', 'meal', 'activity', 'custom');--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "type" SET DEFAULT 'custom'::"public"."activity_type";--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "type" SET DATA TYPE "public"."activity_type" USING "type"::"public"."activity_type";