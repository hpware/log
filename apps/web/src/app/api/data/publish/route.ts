import type { NextRequest } from "next/server";
import { auth } from "@devlogs_hosting/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";
import {
  dorm,
  main_schema,
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
    }
    const userId = session?.session.userId;

    await db.insert(main_schema.userPosts).values({
      postId: generateItemId(),
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

    return Response.json({ success: true, msg: "" });
  } catch (e: any) {
    console.error(e);
    return Response.json(
      { success: false, msg: e.message },
      {
        status: 500,
        statusText: e.message,
      },
    );
  }
};
