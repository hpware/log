import type { NextRequest } from "next/server";
import { db, dorm, main_schema } from "@devlogs_hosting/db";
import { browseSchema } from "@/lib/post-validation";
import { postConditions } from "@/lib/post-query";

export async function GET(request: NextRequest) {
  const start = performance.now();
  const result = (rows: unknown[], extra = {}) => ({
    success: true,
    msg: "",
    data: { rows },
    queryTime: performance.now() - start,
    disabled: false,
    ...extra,
  });
  try {
    const [setting] = await db
      .select()
      .from(main_schema.kvData)
      .where(dorm.eq(main_schema.kvData.key, "searchStatus"));
    if (setting?.value === false)
      return Response.json(
        result([], { disabled: true, msg: "Search is disabled" }),
      );
    const parsed = browseSchema.safeParse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    if (!parsed.success)
      return Response.json(
        result([], { success: false, msg: "Invalid filters" }),
        { status: 400 },
      );
    const filters = parsed.data;
    if (!filters.query && !filters.tag && filters.type === "all")
      return Response.json(result([]));
    const rank = dorm.sql`ts_rank(to_tsvector('english', coalesce(${main_schema.userPosts.textData}, '')), plainto_tsquery('english', ${filters.query}))`;
    const rows = await db
      .select()
      .from(main_schema.userPosts)
      .where(
        dorm.and(
          dorm.eq(main_schema.userPosts.status, "public"),
          postConditions(filters),
        ),
      )
      .orderBy(
        ...(filters.query ? [dorm.desc(rank)] : []),
        dorm.desc(main_schema.userPosts.createdAt),
        dorm.desc(main_schema.userPosts.postId),
      )
      .limit(100);
    return Response.json(result(rows));
  } catch (error) {
    console.error(error);
    return Response.json(
      result([], { success: false, msg: "Could not search posts" }),
      { status: 500 },
    );
  }
}
