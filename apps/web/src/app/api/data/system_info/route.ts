import type { NextRequest } from "next/server";
import projectData from "../../../../../projectData";
import {
  db,
  dorm,
  main_schema,
} from "../../../../../../../packages/db/src/index";

export const GET = async (request: NextRequest) => {
  const getHomePageStatus = await db
    .select()
    .from(main_schema.kvData)
    .where(dorm.eq(main_schema.kvData.key, "homePageStatus"));
  const getSearchPageStatus = await db
    .select()
    .from(main_schema.kvData)
    .where(dorm.eq(main_schema.kvData.key, "searchStatus"));
  const getCopyrightOwner = await db
    .select()
    .from(main_schema.kvData)
    .where(dorm.eq(main_schema.kvData.key, "copyrightOwner"));
  const exposeVersion = await db
    .select()
    .from(main_schema.kvData)
    .where(dorm.eq(main_schema.kvData.key, "exposeVersion"));
  return Response.json({
    copyright_owner: getCopyrightOwner[0].value,
    feature_status: {
      homePage: getHomePageStatus[0].value !== "false",
      search: getSearchPageStatus[0].value !== "false",
    },
    optionalExposeVersion: exposeVersion[0].value !== "false",
    version: exposeVersion[0].value !== "false" ? projectData.version : null,
  });
};
