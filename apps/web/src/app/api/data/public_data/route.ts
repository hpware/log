import type { NextRequest } from "next/server";
import {
  db,
  dorm,
  main_schema,
  auth_schema,
} from "../../../../../../../packages/db/src/index";

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const offset = searchParams.get("offset") || "0";
    const dbResult = await db
      .select()
      .from(main_schema.userPosts)
      .where(dorm.eq(main_schema.userPosts.private, false))
      .orderBy(dorm.asc(main_schema.userPosts.createdAt))
      .limit(50)
      .offset(Number(offset));
    console.log(dbResult);
    return Response.json({ success: true, msg: "", result: dbResult });
  } catch (e: any) {
    console.error(e);
    return Response.json({ success: false, msg: e.message, result: [] });
  }
};
