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

export const POST = async (request: NextRequest) => {
  try {
    const header = await headers();
    const session = await auth.api.getSession({ headers: header });
    if (!session) {
      return Response.json(
        { success: false, msg: "ERR_USR_INVALID_SESSION", uploadUrl: "" },
        { status: 401 },
      );
    }
    const { searchParams } = new URL(request.url);
    const tabAction = searchParams.get("tab");
    const body = await request.json();
    if (!(body && tabAction)) {
      return Response.json(
        {
          success: false,
          status: 400,
          msg: "No enough params",
        },
        {
          status: 400,
          statusText: "No enough params",
        },
      );
    }
    // settings tab
    if (tabAction === "settings") {
      if (session.user.role !== "admin") {
        return Response.json(
          { success: false, msg: "ERR_USR_INVALID_PERMS", uploadUrl: "" },
          { status: 403 },
        );
      }
      // changes to the site title system
      if (
        body.action === "site_title_description" &&
        body.title &&
        body.description
      ) {
        try {
          await db
            .update(main_schema.kvData)
            .set({ value: body.title })
            .where(dorm.eq(main_schema.kvData.key, "title"));
          await db
            .update(main_schema.kvData)
            .set({ value: body.title })
            .where(dorm.eq(main_schema.kvData.key, "title"));
          return Response.json(
            {
              success: true,
              status: 200,
              msg: "",
            },
            {
              status: 200,
            },
          );
        } catch (e: any) {
          return Response.json(
            {
              success: false,
              status: 500,
              msg: e.message,
            },
            {
              status: 500,
            },
          );
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
          return Response.json(
            {
              success: true,
              status: 200,
              msg: "",
              data: {
                homePage,
                registration,
                robotsTxt,
                search,
              },
            },
            {
              status: 200,
            },
          );
        } catch (e: any) {
          return Response.json(
            {
              success: false,
              status: 500,
              msg: e.message,
              data: {},
            },
            {
              status: 500,
            },
          );
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
          };
          if (
            typeof data.homePage !== "boolean" ||
            typeof data.registration !== "boolean" ||
            typeof data.robotsTxt !== "boolean" ||
            typeof data.search !== "boolean"
          ) {
            throw new Error("ERR_INVALID_BODY_TYPE");
          }
          await db
            .update(main_schema.kvData)
            .set({ value: body.data.homePage })
            .where(dorm.eq(main_schema.kvData.key, "homePageStatus"));
          await db
            .update(main_schema.kvData)
            .set({ value: body.data.registration })
            .where(dorm.eq(main_schema.kvData.key, "registrationStatus"));
          await db
            .update(main_schema.kvData)
            .set({ value: body.data.robotsTxt })
            .where(dorm.eq(main_schema.kvData.key, "robotsTxtStatus"));
          await db
            .update(main_schema.kvData)
            .set({ value: body.data.search })
            .where(dorm.eq(main_schema.kvData.key, "searchStatus"));

          return Response.json(
            {
              success: true,
              status: 200,
              msg: "",
            },
            {
              status: 200,
            },
          );
        } catch (e: any) {
          return Response.json(
            {
              success: false,
              status: 500,
              msg: e.message,
            },
            {
              status: 500,
            },
          );
        }
      }
      if (body.action === "site_robots_txt_json") {
        try {
          if (!body.data || typeof body.data !== "object") {
            throw new Error("ERR_INVALID_BODY_DATA_OBJ");
          }

          await db
            .update(main_schema.kvData)
            .set({ value: body.data })
            .where(dorm.eq(main_schema.kvData.key, "robotsTxtList"));

          return Response.json(
            {
              success: true,
              status: 200,
              msg: "",
            },
            {
              status: 200,
            },
          );
        } catch (e: any) {
          return Response.json(
            {
              success: false,
              status: 500,
              msg: e.message,
            },
            {
              status: 500,
            },
          );
        }
      }
      if (body.action === "pullCurrentRobotsTxt") {
        try {
          const currentList = await db
            .select()
            .from(main_schema.kvData)
            .where(dorm.eq(main_schema.kvData.key, "robotsTxtList"));

          return Response.json(
            {
              success: true,
              status: 200,
              msg: "",
              data: currentList[0].value,
            },
            {
              status: 200,
            },
          );
        } catch (e: any) {
          return Response.json(
            {
              success: false,
              status: 500,
              msg: e.message,
              data: {},
            },
            {
              status: 500,
            },
          );
        }
      }
      if (body.action === "change_umami") {
      }
      if (body.action === "change_rybbit") {
      }
      if (body.action === "change_custom_scripts") {
      }
    } else if (tabAction === "post_manage") {
      if (body.action === "delete") {
        try {
          return Response.json({ success: true, msg: "" }, { status: 200 });
        } catch (e: any) {
          return Response.json({ success: false, msg: e.msg }, { status: 500 });
        }
      }
    } else if (tabAction === "admin_user_actions") {
      if (session.user.role !== "admin") {
        return Response.json(
          { success: false, msg: "ERR_USR_INVALID_PERMS", uploadUrl: "" },
          { status: 403 },
        );
      }
      if (body.action === "delete_user") {
        try {
          if (!body.user) {
            throw new Error("No user attached to the body");
          }
          if (body.user === session.user.id) {
            throw new Error("You cannot delete yourself");
          }
          const data = await auth.api.removeUser({
            body: {
              userId: body.user,
            },
            headers: header,
          });
          if (!data.success) {
            throw new Error("Cannot remove user");
          }
          await db
            .delete(main_schema.userPosts)
            .where(dorm.eq(main_schema.userPosts.byUser, body.user));
          return Response.json(
            { success: true, msg: "Deleted User" },
            {
              status: 200,
            },
          );
        } catch (e: any) {
          return Response.json(
            { success: false, msg: e.msg },
            {
              status: 500,
              statusText: e.msg !== undefined ? e.msg : "Server Side Error",
            },
          );
        }
      } else if (body.action === "ban_user") {
        try {
          if (!body.user) {
            throw new Error("No user attached to the body");
          }
          if (body.user === session.user.id) {
            throw new Error("You cannot ban yourself");
          }
          if (!body.reason) {
            throw new Error("No reason attached to the body");
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
          return Response.json(
            { success: true, msg: "Banned User" },
            {
              status: 200,
            },
          );
        } catch (e: any) {
          return Response.json(
            { success: false, msg: e.msg },
            {
              status: 500,
              statusText: e.msg !== undefined ? e.msg : "Server Side Error",
            },
          );
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
          return Response.json(
            { success: true, msg: "Revoked the user's sessions" },
            {
              status: 200,
            },
          );
        } catch (e: any) {
          return Response.json(
            { success: false, msg: e.msg },
            {
              status: 500,
              statusText: e.msg !== undefined ? e.msg : "Server Side Error",
            },
          );
        }
      }
    }
    // last
    return Response.json(
      {
        success: false,
        status: 200,
        msg: "Cannot find request.",
      },
      {
        status: 200,
      },
    );
  } catch (e: any) {
    return Response.json(
      {
        success: false,
        status: 500,
        msg: e.message,
      },
      {
        status: 500,
      },
    );
  }
};
