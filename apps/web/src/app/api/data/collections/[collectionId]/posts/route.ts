import { db, dorm, main_schema } from "../../../../../../../packages/db/src/index";
import { headers } from "next/headers";
import { auth } from "@devlogs_hosting/auth";

export const POST = async (
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
    const { postId, action } = body;

    if (!postId || !action) {
      statusCode = 400;
      throw new Error("ERR_MISSING_POST_ID_OR_ACTION");
    }

    if (action !== "add" && action !== "remove") {
      statusCode = 400;
      throw new Error("ERR_INVALID_ACTION");
    }

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

    const currentItems = collection[0].items as { postIds: string[] };
    let newPostIds: string[];

    if (action === "add") {
      if (currentItems.postIds.includes(postId)) {
        statusCode = 400;
        throw new Error("ERR_POST_ALREADY_IN_COLLECTION");
      }
      newPostIds = [...currentItems.postIds, postId];
    } else {
      newPostIds = currentItems.postIds.filter((id) => id !== postId);
    }

    const updatedCollection = await db
      .update(main_schema.collections)
      .set({
        items: { postIds: newPostIds },
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
      message: action === "add" ? "Post added to collection" : "Post removed from collection",
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