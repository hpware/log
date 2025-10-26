import type { NextRequest } from "next/server";
import {
  db,
  dorm,
  main_schema,
  auth_schema,
} from "../../../../../../../packages/db/src/index";
import { auth } from "@devlogs_hosting/auth";
import { headers } from "next/headers";

export const GET = async (request: NextRequest) => {
  try {
    const header = await headers();
    const session = await auth.api.getSession({ headers: header });
    if (!session) {
      throw new Error("ERR_NOT_LOGGED_IN");
    }
    const { searchParams } = new URL(request.url);
    const offset = searchParams.get("offset");
    const postStatus = searchParams.get("status");
    if (offset === null) {
      throw new Error("ERR_NO_PARAMS_TO_USE");
    }
    if (!/^\d+$/.test(offset)) {
      throw new Error("ERR_OFFSET_PARAM_NOT_A_NUMBER");
    }
    if (!Number.isSafeInteger(Number(offset))) {
      throw new Error("ERR_OFFSET_PARAM_NOT_A_SAFE_INTEGER");
    }
    let query;
    if (postStatus === null) {
      // Get all public posts
      query = dorm.eq(main_schema.userPosts.byUser, session.user.id);
    } else {
      query = dorm.and(
        dorm.eq(main_schema.userPosts.status, postStatus),
        dorm.eq(main_schema.userPosts.byUser, session.user.id),
      );
    }
    const dbResult = await db
      .select()
      .from(main_schema.userPosts)
      .where(query)
      .orderBy(dorm.desc(main_schema.userPosts.createdAt))
      .limit(100)
      .offset(Number(offset));
    return Response.json({
      success: true,
      msg: "",
      result: dbResult,
      nextOffset: Number(offset) + 100,
    });
  } catch (e: any) {
    console.error(e);
    return Response.json(
      { success: false, msg: e.message, result: [] },
      {
        status: 500,
      },
    );
  }
};
