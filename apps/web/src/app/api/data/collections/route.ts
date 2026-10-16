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
