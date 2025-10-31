import type { NextRequest } from "next/server";
import {
  dorm,
  db,
  auth_schema,
  main_schema,
} from "../../../../../../../packages/db/src";

type RobotsParsedJson = Record<string, { allow: string[]; disallow: string[] }>;

export const POST = async (request: NextRequest) => {
  try {
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
          return Response.json(
            {
              success: true,
              status: 200,
              msg: "",
              data: {
                homePage,
                registration,
                robotsTxt,
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
          };
          if (
            typeof data.homePage !== "boolean" ||
            typeof data.registration !== "boolean" ||
            typeof data.robotsTxt !== "boolean"
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
      if (body.action === "change_umami") {
      }
      if (body.action === "change_rybbit") {
      }
      if (body.action === "change_custom_scripts") {
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
