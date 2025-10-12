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
    if (offset === null) {
      throw new Error("ERR_NO_PARAMS_TO_USE");
    }

    if (!/^\d+$/.test(offset)) {
      throw new Error("ERR_OFFSET_PARAM_NOT_A_NUMBER");
    }
    if (!Number.isSafeInteger(Number(offset))) {
      throw new Error("ERR_OFFSET_PARAM_NOT_A_SAFE_INTEGER");
    }

    const dbResult = await db
      .select()
      .from(main_schema.userPosts)
      .where(dorm.eq(main_schema.userPosts.private, false))
      .orderBy(dorm.asc(main_schema.userPosts.createdAt))
      .limit(100)
      .offset(Number(offset));
    console.log(dbResult);
    return Response.json({
      success: true,
      msg: "",
      result: dbResult,
      nextOffset: Number(offset) + 50,
    });
  } catch (e: any) {
    console.error(e);
    return Response.json(
      { success: false, msg: e.message, result: [] },
      {
        status: 500,
        statusText: e.message,
      },
    );
  }
};
