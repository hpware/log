import type { NextRequest } from "next/server";
import {
  dorm,
  db,
  auth_schema,
  main_schema,
} from "../../../../../../../packages/db/src";

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
      if (body.action === "d") {
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
