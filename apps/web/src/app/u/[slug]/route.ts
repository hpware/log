import type { NextRequest } from "next/server";
import {
  db,
  dorm,
  main_schema,
  auth_schema,
} from "../../../../../../packages/db/src/index";
import { notFound } from "next/navigation";

export const GET = async (
  request: NextRequest,
  context: {
    params: Promise<{
      slug: string;
    }>;
  },
) => {
  const { slug } = await context.params;
  const data = await db
    .select()
    .from(main_schema.urlShorter)
    .where(dorm.eq(main_schema.urlShorter.urlSlug, slug));
  if (data.length === 0) {
    return Response.redirect(new URL("/u/404", request.url), 307);
  }
  return Response.redirect(
    new URL(`/item/${data[0].linkedItem}`, request.url),
    301,
  );
};
