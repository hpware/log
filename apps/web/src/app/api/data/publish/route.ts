import { publishSchema } from "@/lib/post-validation";
import type { NextRequest } from "next/server";
import { auth } from "@devlogs_hosting/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";
import {
  dorm,
  main_schema,
  auth_schema,
  db,
} from "../../../../../../../packages/db/src/index";
import generateItemId from "@/components/generateItemId";

export const POST = async (request: NextRequest) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return Response.json(
        { success: false, msg: "Authentication required" },
        { status: 401 },
      );
    }
    const userId = session?.session.userId;

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
          msg: "You have been banned by the instence admins.",
        },
        { status: 403 },
      );
    }

    const parsed = publishSchema.safeParse(await request.json());
    if (!parsed.success)
      return Response.json(
        { success: false, msg: "Invalid post content" },
        { status: 400 },
      );
    const body = parsed.data;
    for (const url of [body.imageUrl, body.videoUrl]) {
      if (
        url?.startsWith("/api/data/files/") &&
        (!url.startsWith(`/api/data/files/${userId}/`) ||
          /%|\/\.\.?\//.test(url))
      ) {
        return Response.json(
          { success: false, msg: "You can only attach your own uploads" },
          { status: 403 },
        );
      }
    }
    const id = generateItemId();
    await db.transaction(async (tx) => {
      let collection;
      if (body.collectionId) {
        [collection] = await tx
          .select()
          .from(main_schema.collections)
          .where(
            dorm.and(
              dorm.eq(main_schema.collections.collectionId, body.collectionId),
              dorm.eq(main_schema.collections.byUser, userId),
            ),
          )
          .for("update");
        if (!collection) throw new Error("ERR_COLLECTION_NOT_FOUND");
      }
      await tx.insert(main_schema.userPosts).values({
        postId: id,
        type: body.type,
        byUser: userId,
        textData: body.text,
        imageUrl: body.type === "photos" ? body.imageUrl : null,
        videoUrl: body.type === "video" ? body.videoUrl : null,
        tags: body.tags,
        status: body.status,
      });
      if (collection)
        await tx
          .update(main_schema.collections)
          .set({
            items: [
              ...(Array.isArray(collection.items) ? collection.items : []),
              id,
            ],
            updatedAt: new Date(),
          })
          .where(
            dorm.eq(
              main_schema.collections.collectionId,
              collection.collectionId,
            ),
          );
    });

    return Response.json({ success: true, msg: "", postId: id });
  } catch (e: any) {
    console.error(e);
    return Response.json(
      {
        success: false,
        msg:
          e.message === "ERR_COLLECTION_NOT_FOUND"
            ? "Collection not found"
            : "Could not publish post",
        postId: null,
      },
      {
        status:
          e instanceof SyntaxError
            ? 400
            : e.message === "ERR_COLLECTION_NOT_FOUND"
              ? 404
              : 500,
      },
    );
  }
};
