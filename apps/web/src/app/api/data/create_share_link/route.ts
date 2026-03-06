import type { NextRequest } from "next/server";
import { auth } from "@devlogs_hosting/auth";
import { headers } from "next/headers";
import {
  dorm,
  main_schema,
  auth_schema,
  db,
} from "../../../../../../../packages/db/src/index";

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateSlug(length = 8) {
  let slug = "";
  for (let i = 0; i < length; i++) {
    slug += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return slug;
}

export const POST = async (request: NextRequest) => {
  try {
    const body: any = await request.json();
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return Response.json(
        { success: false, msg: "Authentication required" },
        { status: 401 },
      );
    }
    const userId = session.session.userId;

    // Check if user is banned
    const user = await db
      .select({ banned: auth_schema.user.banned })
      .from(auth_schema.user)
      .where(dorm.eq(auth_schema.user.id, userId))
      .limit(1);

    if (user[0]?.banned) {
      return Response.json(
        {
          success: false,
          msg: "You have been banned by the instance admins.",
        },
        { status: 403 },
      );
    }

    const { targetUrl, customSlug } = body;

    if (!targetUrl || typeof targetUrl !== "string") {
      return Response.json(
        { success: false, msg: "targetUrl is required" },
        { status: 400 },
      );
    }

    const urlSlug = customSlug || generateSlug();

    // Check if slug already exists
    const existing = await db
      .select()
      .from(main_schema.urlShorter)
      .where(dorm.eq(main_schema.urlShorter.urlSlug, urlSlug))
      .limit(1);

    if (existing.length > 0) {
      return Response.json(
        { success: false, msg: "Slug already taken" },
        { status: 409 },
      );
    }

    await db.insert(main_schema.urlShorter).values({
      urlSlug,
      targetUrl,
      byUser: userId,
    });

    return Response.json({
      success: true,
      msg: "",
      urlSlug,
      shortUrl: `/u/${urlSlug}`,
    });
  } catch (e: any) {
    console.error(e);
    return Response.json(
      { success: false, msg: e.message },
      { status: 500 },
    );
  }
};
