import {
  db,
  dorm,
  main_schema,
  auth_schema,
} from "../../../../../../../packages/db/src/index";
import { headers } from "next/headers";
import { auth } from "@devlogs_hosting/auth";
export const GET = async () => {
  let statusCode;
  try {
    const header = await headers();
    const session = await auth.api.getSession({
      headers: header,
    });
    if (!session) {
      statusCode = 401;
      throw new Error("ERR_NOT_LOGGED_IN");
    }
    const getCollections = await db
      .select()
      .from(main_schema.collections)
      .where(dorm.eq(main_schema.collections.byUser, session.user.id));
    return Response.json({
      data: getCollections.map((i) => {
        (i.collectionId, i.slug, i.title);
      }),
      message: "",
    });
  } catch (e: any) {
    return Response.json(
      {
        data: [],
        message: e.message,
      },
      { status: statusCode || 500 },
    );
  }
};
