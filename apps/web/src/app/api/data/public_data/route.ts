import type { NextRequest } from "next/server";
import { db, dorm } from "@/../../packages/db/src/index";
import { userPosts } from "@/../../packages/db/src/schema/main";

export const GET = async (request: NextRequest) => {
  const dbResult = await db
    .select()
    .from(userPosts)
    .where(dorm.eq(userPosts.private, false))
    .orderBy(dorm.asc(userPosts.createdAt))
    .limit(50)
    .offset(0);
};
