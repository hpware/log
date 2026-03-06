import {
  db,
  dorm,
  main_schema,
} from "../../../../../../../packages/db/src/index";
import { headers } from "next/headers";
import { auth } from "@devlogs_hosting/auth";

export const POST = async (req: Request) => {
  let statusCode;
  try {
    const header = await headers();
    const session = await auth.api.getSession({
      headers: header,
    });
    if (!session) {
      statusCode = 401;
      throw new Error("ERR_NOT_LOGGED_IN");
    }

    const body = await req.json();
    const { title, slug } = body;

    if (!title || !slug) {
      statusCode = 400;
      throw new Error("Title and slug are required");
    }

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      statusCode = 400;
      throw new Error(
        "Slug must be lowercase alphanumeric with hyphens only",
      );
    }

    const existing = await db
      .select()
      .from(main_schema.collections)
      .where(dorm.eq(main_schema.collections.slug, slug));

    if (existing.length > 0) {
      statusCode = 409;
      throw new Error("A collection with this slug already exists");
    }

    const collectionId = crypto.randomUUID();

    await db.insert(main_schema.collections).values({
      collectionId,
      title,
      slug,
      items: {},
      byUser: session.user.id,
    });

    return Response.json({
      success: true,
      data: { collectionId, title, slug },
      message: "Collection created successfully",
    });
  } catch (e: any) {
    return Response.json(
      {
        success: false,
        data: null,
        message: e.message,
      },
      { status: statusCode || 500 },
    );
  }
};
