import { auth } from "@devlogs_hosting/auth";
import { db, dorm, main_schema } from "@devlogs_hosting/db";
import { headers } from "next/headers";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { postIdSchema } from "@/lib/post-validation";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return Response.json(
      { message: "Authentication required" },
      { status: 401 },
    );
  try {
    const parsed = z
      .object({ postId: postIdSchema })
      .safeParse(await request.json());
    if (!parsed.success)
      return Response.json({ message: "Invalid post ID" }, { status: 400 });
    const [post] = await db
      .select()
      .from(main_schema.userPosts)
      .where(
        dorm.and(
          dorm.eq(main_schema.userPosts.postId, parsed.data.postId),
          dorm.eq(main_schema.userPosts.byUser, session.user.id),
        ),
      );
    if (!post)
      return Response.json({ message: "Post not found" }, { status: 404 });
    if (!["public", "unlisted"].includes(post.status))
      return Response.json(
        { message: "Only public and link-only posts can be shared" },
        { status: 400 },
      );
    const targetUrl = `/i/${post.postId}`;
    const [existing] = await db
      .select()
      .from(main_schema.urlShorter)
      .where(
        dorm.and(
          dorm.eq(main_schema.urlShorter.targetUrl, targetUrl),
          dorm.eq(main_schema.urlShorter.byUser, session.user.id),
        ),
      );
    const slug = existing?.urlSlug || randomBytes(12).toString("hex");
    if (!existing)
      await db
        .insert(main_schema.urlShorter)
        .values({ urlSlug: slug, targetUrl, byUser: session.user.id });
    return Response.json({ success: true, url: `/u/${slug}` });
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Could not create share link" },
      { status: error instanceof SyntaxError ? 400 : 500 },
    );
  }
}
