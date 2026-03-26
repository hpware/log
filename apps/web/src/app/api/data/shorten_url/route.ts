import type { NextRequest } from "next/server";
import {
  db,
  dorm,
  main_schema,
  auth_schema,
} from "../../../../../../../packages/db/src/index";
import { auth } from "@devlogs_hosting/auth";
import { headers } from "next/headers";

export const POST = async (request: NextRequest) => {
  try {
    const header = await headers();
    const session = await auth.api.getSession({ headers: header });
    if (!session) {
      return Response.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { urlSlug, targetUrl } = body;

    if (!urlSlug || !targetUrl) {
      return Response.json(
        { success: false, message: "urlSlug and targetUrl are required" },
        { status: 400 },
      );
    }

    if (!/^[a-zA-Z0-9-_]+$/.test(urlSlug)) {
      return Response.json(
        {
          success: false,
          message:
            "Slug can only contain letters, numbers, hyphens and underscores",
        },
        { status: 400 },
      );
    }

    const existing = await db
      .select()
      .from(main_schema.urlShorter)
      .where(dorm.eq(main_schema.urlShorter.urlSlug, urlSlug));

    if (existing.length > 0) {
      return Response.json(
        { success: false, message: "Slug already taken" },
        { status: 409 },
      );
    }

    const result = await db
      .insert(main_schema.urlShorter)
      .values({
        urlSlug,
        targetUrl,
        byUser: session.user.id,
      })
      .returning();

    return Response.json({
      success: true,
      message: "Short URL created",
      data: result[0],
    });
  } catch (e: any) {
    console.error(e);
    return Response.json(
      { success: false, message: e.message },
      { status: 500 },
    );
  }
};