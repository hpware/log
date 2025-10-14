import {
  pgTable,
  text,
  timestamp,
  check,
  boolean,
  jsonb,
  integer,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth";

export const userPosts = pgTable(
  "user_posts",
  {
    postId: text("post_id").primaryKey(),
    type: text("type").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    byUser: text("by_user")
      .notNull()
      .references(() => user.id),
    textData: text("text_data"),
    imageUrl: text("image_url"),
    videoUrl: text("video_url"),
    status: text("status").notNull().default("draft"),
    tags: jsonb("tags").default([]),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    check("type_check", sql`${table.type} IN ('photos', 'text', 'video')`),
    check(
      "checkcorrectstatus",
      sql`${table.status} IN ('draft', 'private', 'public', 'unlisted')`,
    ),
    check(
      "image_url_check",
      sql`${table.type} != 'photos' OR ${table.imageUrl} IS NOT NULL`,
    ),
    check(
      "video_url_check",
      sql`${table.type} != 'video' OR ${table.videoUrl} IS NOT NULL`,
    ),
  ],
);

export const kvData = pgTable("kv_data", {
  id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
//export const postTrackCount
