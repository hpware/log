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
    } else if (tabAction === "edit") {
      if (body.action === "change_visibility") {
      } else if (body.action === "change_post") {
      }
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
