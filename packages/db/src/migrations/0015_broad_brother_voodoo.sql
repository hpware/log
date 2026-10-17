ALTER TABLE "collections" DROP CONSTRAINT "collections_by_user_user_id_fk";
--> statement-breakpoint
ALTER TABLE "url_shorter" DROP CONSTRAINT "url_shorter_by_user_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user_posts" DROP CONSTRAINT "user_posts_by_user_user_id_fk";
--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_by_user_user_id_fk" FOREIGN KEY ("by_user") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "url_shorter" ADD CONSTRAINT "url_shorter_by_user_user_id_fk" FOREIGN KEY ("by_user") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_posts" ADD CONSTRAINT "user_posts_by_user_user_id_fk" FOREIGN KEY ("by_user") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;