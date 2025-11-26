import type { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@devlogs_hosting/auth";
import {
  db,
  main_schema,
  dorm,
} from "../../../../../../../../packages/db/src/index"; // idk why is this soo long

export const GET = async () => {
  return Response.json(
    {
      data: null,
      message: "ERR_NO_REQUESTED_QUERY",
    },
    {
      status: 404,
      statusText: "ERR_NO_REQUESTED_QUERY",
    },
  );
};

export const POST = async (request: NextRequest) => {
  let statusCode;
  try {
    const header = await headers();
    const session = await auth.api.getSession({ headers: header });
    if (!session) {
      statusCode = 401;
      throw new Error("ERR_USR_INVALID_SESSION");
    }
    const { searchParams } = new URL(request.url);
    const tabAction = searchParams.get("tab");
    const body = await request.json();
    if (tabAction === "post_manage") {
      if (body.action === "delete_post") {
        if (!body.postId) {
          statusCode = 400;
          throw new Error("ERR_NO_BODY_ID");
        }
        const data = await db
          .select()
          .from(main_schema.userPosts)
          .where(dorm.eq(main_schema.userPosts.postId, body.postId));
        if (data[0].byUser !== session.user.id) {
          statusCode = 403;
          throw new Error("ERR_NO_PERMS");
        }
        await db
          .delete(main_schema.userPosts)
          .where(dorm.eq(main_schema.userPosts.postId, body.postId));
        return Response.json({
          data: null,
          message: "ok",
        });
      } else if (body.action === "delete_post_admin") {
        if (session.user.role !== "admin") {
          statusCode = 403;
          throw new Error("ERR_NO_PERMS");
        }
        if (!body.postId) {
          statusCode = 400;
          throw new Error("ERR_NO_BODY_ID");
        }
        await db
          .delete(main_schema.userPosts)
          .where(dorm.eq(main_schema.userPosts.postId, body.postId));
        return Response.json({
          data: null,
          message: "ok",
        });
      }
    } else if (tabAction === "edit" && body.action === "change_post") {
      if (!/^_ITM[A-Za-z0-9]{20}$/.test(body.postId)) {
        statusCode = 400;
        throw new Error("ERR_WRONG_POSTID");
      }
      if (!body.postStatus) {
        statusCode = 400;
        throw new Error("ERR_NO_CORRECT_BODY");
      }

      const postData: {
        status: "draft" | "private" | "public" | "unlisted";
        postId: string;
        type: "photos" | "text" | "video";
        createdAt: Date;
        updatedAt: Date;
        byUser: string;
        textData: string | null;
        imageUrl: string | null;
        videoUrl: string | null;
        tags: unknown;
      } = body.postStatus;

      if (postData.postId !== body.postId) {
        throw new Error("ERR_NO_MATCH");
      }

      const getPost = await db
        .select()
        .from(main_schema.userPosts)
        .where(dorm.eq(main_schema.userPosts.postId, body.postId));

      if (getPost.length === 0) {
        statusCode = 404;
        throw new Error("ERR_NO_POST_FOUND");
      }

      if (getPost[0].byUser !== postData.byUser) {
        statusCode = 403;
        throw new Error("ERR_NO_PERMS");
      }
      try {
        await db
          .update(main_schema.userPosts)
          .set({
            status: postData.status,
            updatedAt: new Date(),
            textData: postData.textData,
            tags: postData.tags,
          })
          .where(dorm.eq(main_schema.userPosts.postId, body.postId));
      } catch (e: any) {
        throw new Error(e.message);
      }
      return Response.json({
        data: null,
        message: "ok",
      });
    }
    statusCode = 404;
    throw new Error("ERR_NO_REQUESTED_QUERY");
  } catch (e: any) {
    console.error(e);
    return Response.json(
      {
        data: null,
        message: e.message || "ERR_UNKNOWN",
      },
      {
        status: statusCode || 500,
        statusText: e.message || "ERR_UNKNOWN",
      },
    );
  }
};
