import { auth } from "@devlogs_hosting/auth";
import { db, dorm, main_schema } from "@devlogs_hosting/db";
import { headers } from "next/headers";
import { z } from "zod";
import generateItemId from "@/components/generateItemId";

const collectionSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return Response.json(
      { message: "Authentication required" },
      { status: 401 },
    );
  try {
    const parsed = collectionSchema.safeParse(await request.json());
    if (!parsed.success)
      return Response.json(
        { message: "Provide a title and a lowercase, hyphen-separated slug" },
        { status: 400 },
      );
    const [collection] = await db
      .insert(main_schema.collections)
      .values({
        ...parsed.data,
        collectionId: generateItemId(),
        byUser: session.user.id,
        items: [],
      })
      .onConflictDoNothing({ target: main_schema.collections.slug })
      .returning();
    if (!collection)
      return Response.json(
        { message: "That slug is already in use" },
        { status: 409 },
      );
    return Response.json({ data: collection }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError)
      return Response.json({ message: "Invalid JSON" }, { status: 400 });
    console.error(error);
    return Response.json(
      { message: "Could not create collection" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return Response.json(
      { message: "Authentication required" },
      { status: 401 },
    );
  const id = new URL(request.url).searchParams.get("id");
  if (!id)
    return Response.json(
      { message: "Collection ID required" },
      { status: 400 },
    );
  const removed = await db
    .delete(main_schema.collections)
    .where(
      dorm.and(
        dorm.eq(main_schema.collections.collectionId, id),
        dorm.eq(main_schema.collections.byUser, session.user.id),
      ),
    )
    .returning({ id: main_schema.collections.collectionId });
  if (!removed.length)
    return Response.json({ message: "Collection not found" }, { status: 404 });
  return Response.json({ success: true });
}

export async function PUT(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return Response.json(
      { message: "Authentication required" },
      { status: 401 },
    );
  try {
    const parsed = collectionSchema
      .extend({
        collectionId: z.string().min(1),
        items: z.array(z.string().regex(/^_ITM[A-Za-z0-9]{20}$/)).max(1000),
      })
      .safeParse(await request.json());
    if (!parsed.success)
      return Response.json(
        { message: "Invalid collection details" },
        { status: 400 },
      );
    const { collectionId, title, slug, items } = parsed.data;
    const result = await db.transaction(async (tx) => {
      const [collection] = await tx
        .select()
        .from(main_schema.collections)
        .where(
          dorm.and(
            dorm.eq(main_schema.collections.collectionId, collectionId),
            dorm.eq(main_schema.collections.byUser, session.user.id),
          ),
        )
        .for("update");
      if (!collection) return { status: 404, message: "Collection not found" };
      const uniqueItems = [...new Set(items)];
      if (uniqueItems.length) {
        const posts = await tx
          .select({ id: main_schema.userPosts.postId })
          .from(main_schema.userPosts)
          .where(
            dorm.and(
              dorm.inArray(main_schema.userPosts.postId, uniqueItems),
              dorm.eq(main_schema.userPosts.byUser, session.user.id),
            ),
          );
        if (posts.length !== uniqueItems.length)
          return {
            status: 400,
            message: "Only your existing posts can be added",
          };
      }
      await tx
        .update(main_schema.collections)
        .set({ title, slug, items: uniqueItems, updatedAt: new Date() })
        .where(dorm.eq(main_schema.collections.collectionId, collectionId));
      return { status: 200, message: "Collection saved" };
    });
    return Response.json(
      { message: result.message, success: result.status === 200 },
      { status: result.status },
    );
  } catch (error: any) {
    if (error instanceof SyntaxError)
      return Response.json({ message: "Invalid JSON" }, { status: 400 });
    if (error.code === "23505" || error.cause?.code === "23505")
      return Response.json(
        { message: "That slug is already in use" },
        { status: 409 },
      );
    console.error(error);
    return Response.json(
      { message: "Could not save collection" },
      { status: 500 },
    );
  }
}
