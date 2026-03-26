import type { NextRequest } from "next/server";
import {
  db,
  dorm,
  main_schema,
  auth_schema,
} from "../../../../../../../packages/db/src/index";
import { auth } from "@devlogs_hosting/auth";
import { headers } from "next/headers";

export const GET = async () => {
  try {
    const header = await headers();
    const session = await auth.api.getSession({ headers: header });
    if (!session) {
      return Response.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const urls = await db
      .select()
      .from(main_schema.urlShorter)
      .where(dorm.eq(main_schema.urlShorter.byUser, session.user.id))
      .orderBy(dorm.desc(main_schema.urlShorter.createdAt));

    return Response.json({
      success: true,
      data: urls,
    });
  } catch (e: any) {
    console.error(e);
    return Response.json(
      { success: false, message: e.message },
      { status: 500 },
    );
  }
};