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

    const id = generateItemId();
    await db.insert(main_schema.userPosts).values({
      postId: id,
      type: body.type,
      byUser: userId,
      ...(body.text?.length > 0 && { textData: body.text }),
      ...(body.type === "photos" &&
        body.imageUrl && { imageUrl: body.imageUrl }),
      ...(body.type === "video" &&
        body.videoUrl && { videoUrl: body.videoUrl }),
      ...(body.tags && { tags: body.tags }),
      ...(body.status && { status: body.status }),
    });

    return Response.json({ success: true, msg: "", postId: id });
  } catch (e: any) {
    console.error(e);
    return Response.json(
      { success: false, msg: e.message, postId: null },
      {
        status: 500,
      },
    );
  }
};
