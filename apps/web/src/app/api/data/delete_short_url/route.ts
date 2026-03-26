import type { NextRequest } from "next/server";
import {
  db,
  dorm,
  main_schema,
  auth_schema,
} from "../../../../../../../packages/db/src/index";
import { auth } from "@devlogs_hosting/auth";
import { headers } from "next/headers";

export const DELETE = async (request: NextRequest) => {
  try {
    const header = await headers();
    const session = await auth.api.getSession({ headers: header });
    if (!session) {
      return Response.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json(
        { success: false, message: "URL ID is required" },
        { status: 400 },
      );
    }

    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      return Response.json(
        { success: false, message: "Invalid URL ID" },
        { status: 400 },
      );
    }

    const existing = await db
      .select()
      .from(main_schema.urlShorter)
      .where(
        dorm.and(
          dorm.eq(main_schema.urlShorter.id, numericId),
          dorm.eq(main_schema.urlShorter.byUser, session.user.id),
        ),
      );

    if (existing.length === 0) {
      return Response.json(
        { success: false, message: "URL not found or not owned by you" },
        { status: 404 },
      );
    }

    await db
      .delete(main_schema.urlShorter)
      .where(dorm.eq(main_schema.urlShorter.id, numericId));

    return Response.json({
      success: true,
      message: "Short URL deleted",
    });
  } catch (e: any) {
    console.error(e);
    return Response.json(
      { success: false, message: e.message },
      { status: 500 },
    );
  }
};