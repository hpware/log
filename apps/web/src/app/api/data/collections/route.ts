import { db, dorm, main_schema } from "../../../../../../../packages/db/src/index";
import { headers } from "next/headers";
import { auth } from "@devlogs_hosting/auth";
import { nanoid } from "nanoid";

export const POST = async (request: Request) => {
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

    const body = await request.json();
    const { title, slug } = body;

    if (!title || !slug) {
      statusCode = 400;
      throw new Error("ERR_MISSING_TITLE_OR_SLUG");
    }

    const existingCollection = await db
      .select()
      .from(main_schema.collections)
      .where(dorm.eq(main_schema.collections.slug, slug));

    if (existingCollection.length > 0) {
      statusCode = 400;
      throw new Error("ERR_SLUG_ALREADY_EXISTS");
    }

    const newCollection = await db
      .insert(main_schema.collections)
      .values({
        collectionId: nanoid(20),
        title,
        slug,
        items: { postIds: [] },
        byUser: session.user.id,
      })
      .returning();

    return Response.json({
      success: true,
      data: newCollection[0],
      message: "Collection created successfully",
    });
  } catch (e: any) {
    return Response.json(
      {
        success: false,
        data: null,
        message: e.message,
      },
      { status: statusCode || 500 }
    );
  }
};

export const GET = async () => {
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
    const getCollections = await db
      .select()
      .from(main_schema.collections)
      .where(dorm.eq(main_schema.collections.byUser, session.user.id));
    return Response.json({
      success: true,
      data: getCollections,
      message: "",
    });
  } catch (e: any) {
    return Response.json(
      {
        success: false,
        data: [],
        message: e.message,
      },
      { status: statusCode || 500 }
    );
  }
};