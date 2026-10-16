import type { NextRequest } from "next/server";
import {
  dorm,
  db,
  auth_schema,
  main_schema,
} from "../../../../../../../packages/db/src";
import { headers } from "next/headers";
import { auth } from "@devlogs_hosting/auth";

type RobotsParsedJson = Record<string, { allow: string[]; disallow: string[] }>;

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
  let statusCode = 500;
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
    if (!(body && tabAction)) {
      statusCode = 400;
      throw new Error("ERR_INCORRECT_PARAMS");
    }

    // settings tab
    if (tabAction === "settings") {
      if (session.user.role !== "admin") {
        statusCode = 403;
        throw new Error("ERR_USR_INVALID_PERMS");
      }
      // changes to the site title system
      if (
        body.action === "site_title_description" &&
        body.title &&
        body.description &&
        body.server_owner
      ) {
        try {
          await db
            .update(main_schema.kvData)
            .set({ value: body.title })
            .where(dorm.eq(main_schema.kvData.key, "title"));
          await db
            .update(main_schema.kvData)
            .set({ value: body.description })
            .where(dorm.eq(main_schema.kvData.key, "description"));
          await db
            .update(main_schema.kvData)
            .set({ value: body.server_owner })
            .where(dorm.eq(main_schema.kvData.key, "copyrightOwner"));
          return Response.json({
            success: true,
            status: 200,
            msg: "",
          });
        } catch (e: any) {
          statusCode = 500;
          throw new Error(e.message || "ERR_GENERIC");
        }
      }
      if (body.action === "obtain_toggle_data_for_robotsTxt_and_others") {
        try {
          // get checkEnabledStatuses
          const homePage = (
            await db
              .select()
              .from(main_schema.kvData)
              .where(dorm.eq(main_schema.kvData.key, "homePageStatus"))
          )[0].value;
          const registration = (
            await db
              .select()
              .from(main_schema.kvData)
              .where(dorm.eq(main_schema.kvData.key, "registrationStatus"))
          )[0].value;
          const robotsTxt = (
            await db
              .select()
              .from(main_schema.kvData)
              .where(dorm.eq(main_schema.kvData.key, "robotsTxtStatus"))
          )[0].value;
          const search = (
            await db
              .select()
              .from(main_schema.kvData)
              .where(dorm.eq(main_schema.kvData.key, "searchStatus"))
          )[0].value;
          const displayVersion = (
            await db
              .select()
              .from(main_schema.kvData)
              .where(dorm.eq(main_schema.kvData.key, "exposeVersion"))
          )[0].value;
          return Response.json({
            success: true,
            status: 200,
            msg: "",
            data: {
              homePage,
              registration,
              robotsTxt,
              search,
              displayVersion,
            },
          });
        } catch (e: any) {
          statusCode = 500;
          throw new Error(e.message || "ERR_GENERIC");
        }
      }
      if (body.action === "change_home_page_register_robotstxt_toggles") {
        try {
          if (!body.data || typeof body.data !== "object") {
            throw new Error("ERR_INVALID_BODY_DATA_OBJ");
          }
          const data = body.data as {
            homePage: boolean;
            registration: boolean;
            robotsTxt: boolean;
            search: boolean;
            displayVersion: boolean;
          };
          if (
            typeof data.homePage !== "boolean" ||
            typeof data.registration !== "boolean" ||
            typeof data.robotsTxt !== "boolean" ||
            typeof data.search !== "boolean" ||
            typeof data.displayVersion !== "boolean"
          ) {
            throw new Error("ERR_INVALID_BODY_TYPE");
          }
          await db.transaction(async (tx) => {
            for (const [key, value] of Object.entries({
              homePageStatus: data.homePage,
              registrationStatus: data.registration,
              robotsTxtStatus: data.robotsTxt,
              searchStatus: data.search,
              exposeVersion: data.displayVersion,
            })) {
              await tx
                .insert(main_schema.kvData)
                .values({ key, value })
                .onConflictDoUpdate({
                  target: main_schema.kvData.key,
                  set: { value, updatedAt: new Date() },
                });
            }
          });
          return Response.json({
            success: true,
            status: 200,
            msg: "",
          });
        } catch (e: any) {
          statusCode = 500;
          throw new Error(e.message || "ERR_GENERIC");
        }
      } else if (body.action === "site_robots_txt_json") {
        try {
          if (!body.data || typeof body.data !== "object") {
            throw new Error("ERR_INVALID_BODY_DATA_OBJ");
          }

          await db
            .update(main_schema.kvData)
            .set({ value: body.data })
            .where(dorm.eq(main_schema.kvData.key, "robotsTxtList"));

          return Response.json({
            success: true,
            status: 200,
            msg: "",
          });
        } catch (e: any) {
          statusCode = 500;
          throw new Error(e.message || "ERR_GENERIC");
        }
      }
      if (body.action === "pullCurrentRobotsTxt") {
        try {
          const currentList = await db
            .select()
            .from(main_schema.kvData)
            .where(dorm.eq(main_schema.kvData.key, "robotsTxtList"));

          return Response.json({
            success: true,
            status: 200,
            msg: "",
            data: currentList[0].value,
          });
        } catch (e: any) {
          statusCode = 500;
          throw new Error(e.message || "ERR_GENERIC");
        }
      }
    } else if (tabAction === "admin_user_actions") {
      if (session.user.role !== "admin") {
        statusCode = 403;
        throw new Error("ERR_USR_INVALID_PERMS");
      }
      if (body.action === "delete_user") {
        try {
          if (!body.user) {
            throw new Error("No user attached to the body");
          }
          if (body.user === session.user.id) {
            throw new Error("You cannot delete yourself");
          }
          await db
            .delete(main_schema.userPosts)
            .where(dorm.eq(main_schema.userPosts.byUser, body.user));
          await db
            .delete(main_schema.collections)
            .where(dorm.eq(main_schema.collections.byUser, body.user));
          await db
            .delete(main_schema.urlShorter)
            .where(dorm.eq(main_schema.urlShorter.byUser, body.user));
          const data = await auth.api.removeUser({
            body: {
              userId: body.user,
            },
            headers: header,
          });
          if (!data.success) {
            statusCode = 500;
            throw new Error("ERR_REMOVE_FAILED");
          }
          return Response.json({ success: true, msg: "Deleted User" });
        } catch (e: any) {
          console.log(e);
          statusCode = 403;
          throw new Error(e.message || "ERR_GENERIC");
        }
      } else if (body.action === "ban_user") {
        try {
          if (!body.user) {
            throw new Error("ERR_NO_USER_ATTACHED");
          }
          if (body.user === session.user.id) {
            throw new Error("ERR_CANNOT_BAN_THIS_USER");
          }
          if (!body.reason) {
            throw new Error("ERR_NO_REASON_ATTACHED");
          }
          await auth.api.banUser({
            body: {
              userId: body.user,
              banReason: body.reason,
              ...(body.banLength && { banExpiresIn: body.banLength }),
            },
            // This endpoint requires session cookies.
            headers: header,
          });
          await db
            .update(main_schema.userPosts)
            .set({ status: "draft" }) // making every post a "draft" instaed of making it unlisted
            .where(dorm.eq(main_schema.userPosts.byUser, body.user));
          return Response.json({ success: true, msg: "Banned User" });
        } catch (e: any) {
          console.log(e);
          statusCode = 500;
          throw new Error(e.message || "ERR_GENERIC");
        }
      } else if (body.action === "revoke_sessions") {
        try {
          if (!body.user) {
            throw new Error("No user attached to the ban");
          }
          const data = await auth.api.revokeUserSessions({
            body: {
              userId: body.user,
            },
            // This endpoint requires session cookies.
            headers: header,
          });
          if (!data.success) {
            throw new Error("Failed to revoke the user's sessions");
          }
          return Response.json({
            success: true,
            msg: "Revoked the user's sessions",
          });
        } catch (e: any) {
          console.log(e);
          statusCode = 500;
          throw new Error(e.message || "ERR_GENERIC");
        }
      } else if (body.action === "change_perms") {
        try {
          if (body.user === session.user.id) {
            statusCode = 401;
            throw new Error("ERR_CANNOT_CHANGE_SELF");
          }
          await auth.api.adminUpdateUser({
            body: {
              userId: body.user,
              data: { role: body.role },
            },
            headers: await headers(),
          });
          return Response.json({ success: true, msg: "Permissions updated" });
        } catch (e: any) {
          console.log(e);
          throw new Error(e.message || "ERR_GENERIC");
        }
      }
    } else if (tabAction === "non_admin_user") {
      if (body.action === "profile_pic_update") {
        try {
          if (
            typeof body.imageUrl !== "string" ||
            !body.imageUrl.startsWith(`/api/data/files/${session.user.id}/`) ||
            /[?#]/.test(body.imageUrl)
          ) {
            statusCode = 400;
            throw new Error("ERR_INCORRECT_PARAMSs");
          }

          await db
            .update(auth_schema.user)
            .set({ image: body.imageUrl })
            .where(dorm.eq(auth_schema.user.id, session.user.id));

          return Response.json(
            { success: true, msg: "Profile picture updated successfully" },
            { status: 200 },
          );
        } catch (e: any) {
          console.log(e);
          statusCode = 500;
          throw new Error(e.message || "ERR_GENERIC");
        }
      }
    }
    // last
    return Response.json(
      {
        success: false,
        status: 404,
        msg: "Cannot find request.",
      },
      {
        status: 404,
      },
    );
  } catch (e: any) {
    return Response.json(
      {
        success: false,
        status: statusCode,
        msg: e.message,
        data: {},
      },
      {
        status: statusCode,
      },
    );
  }
};
