import { db, dorm, main_schema } from "../../../../../../../packages/db/src/index";
import { headers } from "next/headers";
import { auth } from "@devlogs_hosting/auth";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ collectionId: string }> }
) => {
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

    const { collectionId } = await params;

    const collection = await db
      .select()
      .from(main_schema.collections)
      .where(
        dorm.and(
          dorm.eq(main_schema.collections.collectionId, collectionId),
          dorm.eq(main_schema.collections.byUser, session.user.id)
        )
      );

    if (collection.length === 0) {
      statusCode = 404;
      throw new Error("ERR_COLLECTION_NOT_FOUND");
    }

    return Response.json({
      success: true,
      data: collection[0],
      message: "",
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

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ collectionId: string }> }
) => {
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

    const { collectionId } = await params;
    const body = await request.json();
    const { title, slug } = body;

    if (!title || !slug) {
      statusCode = 400;
      throw new Error("ERR_MISSING_TITLE_OR_SLUG");
    }

    const existingCollection = await db
      .select()
      .from(main_schema.collections)
      .where(
        dorm.and(
          dorm.eq(main_schema.collections.collectionId, collectionId),
          dorm.eq(main_schema.collections.byUser, session.user.id)
        )
      );

    if (existingCollection.length === 0) {
      statusCode = 404;
      throw new Error("ERR_COLLECTION_NOT_FOUND");
    }

    const slugCheck = await db
      .select()
      .from(main_schema.collections)
      .where(
        dorm.and(
          dorm.eq(main_schema.collections.slug, slug),
          dorm.eq(main_schema.collections.byUser, session.user.id),
          dorm.ne(main_schema.collections.collectionId, collectionId)
        )
      );

    if (slugCheck.length > 0) {
      statusCode = 400;
      throw new Error("ERR_SLUG_ALREADY_EXISTS");
    }

    const updatedCollection = await db
      .update(main_schema.collections)
      .set({
        title,
        slug,
        updatedAt: new Date(),
      })
      .where(
        dorm.and(
          dorm.eq(main_schema.collections.collectionId, collectionId),
          dorm.eq(main_schema.collections.byUser, session.user.id)
        )
      )
      .returning();

    return Response.json({
      success: true,
      data: updatedCollection[0],
      message: "Collection updated successfully",
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

export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ collectionId: string }> }
) => {
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

    const { collectionId } = await params;

    const existingCollection = await db
      .select()
      .from(main_schema.collections)
      .where(
        dorm.and(
          dorm.eq(main_schema.collections.collectionId, collectionId),
          dorm.eq(main_schema.collections.byUser, session.user.id)
        )
      );

    if (existingCollection.length === 0) {
      statusCode = 404;
      throw new Error("ERR_COLLECTION_NOT_FOUND");
    }

    await db
      .delete(main_schema.collections)
      .where(
        dorm.and(
          dorm.eq(main_schema.collections.collectionId, collectionId),
          dorm.eq(main_schema.collections.byUser, session.user.id)
        )
      );

    return Response.json({
      success: true,
      message: "Collection deleted successfully",
    });
  } catch (e: any) {
    return Response.json(
      {
        success: false,
        message: e.message,
      },
      { status: statusCode || 500 }
    );
  }
};