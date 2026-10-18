import { dorm, main_schema } from "@devlogs_hosting/db";
import type { z } from "zod";
import type { browseSchema } from "./post-validation";

export function postConditions(filters: z.infer<typeof browseSchema>) {
  return dorm.and(
    filters.query
      ? dorm.sql`to_tsvector('english', coalesce(${main_schema.userPosts.textData}, '')) @@ plainto_tsquery('english', ${filters.query})`
      : undefined,
    filters.tag
      ? dorm.sql`${main_schema.userPosts.tags} @> ${JSON.stringify([filters.tag])}::jsonb`
      : undefined,
    filters.type !== "all"
      ? dorm.eq(main_schema.userPosts.type, filters.type)
      : undefined,
  );
}
