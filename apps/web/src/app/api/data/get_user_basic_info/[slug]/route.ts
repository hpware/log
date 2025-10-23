import type { NextRequest } from "next/server";
import {
  db,
  dorm,
  auth_schema,
} from "../../../../../../../../packages/db/src/index";

type User = typeof auth_schema.user.$inferSelect;

export const GET = async (
  request: NextRequest,
  context: {
    params: Promise<{
      slug: string;
    }>;
  },
) => {
  try {
    const { slug } = await context.params;
    const content: User[] = await db
      .select()
      .from(auth_schema.user)
      .where(dorm.eq(auth_schema.user.id, slug));

    if (content.length === 0) {
      throw new Error("ERR_USER_NOT_FOUND");
    }
    return Response.json({
      success: true,
      msg: "",
      content: {
        id: content[0].id,
        name: content[0].name,
        image: content[0].image,
        banned: content[0].banned,
      },
    });
  } catch (e: any) {
    return Response.json({
      success: false,
      msg: e.message,
      content: {
        id: null,
        name: null,
        image: null,
        banned: false,
      },
    });
  }
};
