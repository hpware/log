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
    const offset = searchParams.get("offset");
    const pullFromUserId = searchParams.get("user");
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
    if (pullFromUserId === null) {
      // Get all public posts
      query = dorm.eq(main_schema.userPosts.status, "public");
      const homePageStatus = await db
        .select()
        .from(main_schema.kvData)
        .where(dorm.eq(main_schema.kvData.key, "homePageStatus"));

      if (String(homePageStatus[0].value) === "false") {
        return Response.json({
          success: true,
          msg: "",
          result: [],
          nextOffset: Number(offset) + 50,
          featDisabled: true,
        });
      }
    } else {
      query = dorm.and(
        dorm.eq(main_schema.userPosts.status, "public"),
        dorm.eq(main_schema.userPosts.byUser, pullFromUserId),
      );
    }
    const dbResult = await db
      .select()
      .from(main_schema.userPosts)
      .where(query)
      .orderBy(dorm.desc(main_schema.userPosts.createdAt))
      .limit(50)
      .offset(Number(offset));
    return Response.json({
      success: true,
      msg: "",
      result: dbResult,
      nextOffset: Number(offset) + 50,
      featDisabled: false,
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
