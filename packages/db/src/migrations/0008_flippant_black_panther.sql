ALTER TABLE "tags" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "tags" CASCADE;--> statement-breakpoint
CREATE INDEX "title_search_index" ON "user_posts" USING gin (to_tsvector('english', "text_data"));