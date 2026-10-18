import type { NextRequest } from "next/server";
import * as s3 from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@devlogs_hosting/auth";
import { db, dorm, main_schema, auth_schema } from "@devlogs_hosting/db";
import { canReadPost } from "@/lib/post-validation";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string[] }> },
) {
  try {
    const { slug } = await context.params;
    if (
      slug.some((part) => part === "." || part === ".." || part.includes("/"))
    )
      return new Response(null, { status: 400 });
    const key = slug.join("/");
    const mediaUrl = `/api/data/files/${key}`;
    const session = await auth.api.getSession({ headers: request.headers });
    // Uploaded files inherit the visibility of posts that reference them. The uploader
    // can also preview an upload before saving it to a post or their profile.
    if (!session || slug[0] !== session.user.id) {
      const posts = await db
        .select({
          status: main_schema.userPosts.status,
          byUser: main_schema.userPosts.byUser,
        })
        .from(main_schema.userPosts)
        .where(
          dorm.or(
            dorm.eq(main_schema.userPosts.imageUrl, mediaUrl),
            dorm.eq(main_schema.userPosts.videoUrl, mediaUrl),
          ),
        );
      const [avatar] = await db
        .select({ id: auth_schema.user.id })
        .from(auth_schema.user)
        .where(dorm.eq(auth_schema.user.image, mediaUrl))
        .limit(1);
      if (!avatar && !posts.some((post) => canReadPost(post, session?.user.id)))
        return new Response(null, { status: 404 });
    }
    if (!s3.s3Config.isConfigured)
      return Response.json(
        { error: "S3 storage not configured" },
        { status: 503 },
      );
    const range = request.headers.get("range");
    const response = await s3.s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
        ...(range && { Range: range }),
      }),
    );
    if (!response.Body) return new Response(null, { status: 404 });
    return new Response(response.Body.transformToWebStream(), {
      status: response.ContentRange ? 206 : 200,
      headers: {
        "Content-Type": response.ContentType || "application/octet-stream",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Accept-Ranges": "bytes",
        ...(response.ContentLength !== undefined && {
          "Content-Length": String(response.ContentLength),
        }),
        ...(response.ContentRange && {
          "Content-Range": response.ContentRange,
        }),
        ...(response.ETag && { ETag: response.ETag }),
      },
    });
  } catch (error: any) {
    const status = error.$metadata?.httpStatusCode;
    if (status === 404 || status === 416) return new Response(null, { status });
    console.error("File request failed", error);
    return Response.json({ error: "Could not retrieve file" }, { status: 500 });
  }
}
