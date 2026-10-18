CREATE TABLE "tags" (
	"tag_id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_posts" ADD COLUMN "tags" jsonb;