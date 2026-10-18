import { db, dorm, main_schema, auth_schema } from "@devlogs_hosting/db";
import { notFound } from "next/navigation";
import { auth } from "@devlogs_hosting/auth";
import { headers } from "next/headers";
import { PublicPostsAndVideos } from "@/components/publicPostsAndVideos";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [collection] = await db
    .select()
    .from(main_schema.collections)
    .where(dorm.eq(main_schema.collections.slug, slug));
  if (!collection) notFound();
  const session = await auth.api.getSession({ headers: await headers() });
  const [owner] = await db
    .select({ name: auth_schema.user.name })
    .from(auth_schema.user)
    .where(dorm.eq(auth_schema.user.id, collection.byUser));
  const ids = Array.isArray(collection.items)
    ? collection.items.filter(
        (item): item is string => typeof item === "string",
      )
    : [];
  const posts = ids.length
    ? await db
        .select()
        .from(main_schema.userPosts)
        .where(
          dorm.and(
            dorm.inArray(main_schema.userPosts.postId, ids),
            dorm.eq(main_schema.userPosts.byUser, collection.byUser),
            session?.user.id === collection.byUser
              ? undefined
              : dorm.eq(main_schema.userPosts.status, "public"),
          ),
        )
        .orderBy(dorm.desc(main_schema.userPosts.createdAt))
    : [];
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl">{collection.title}</h1>
      <Link href={`/user/${collection.byUser}`} className="underline">
        By {owner?.name || "Unknown user"}
      </Link>
      {posts.length ? (
        <PublicPostsAndVideos mode="search" passedData={posts} />
      ) : (
        <p>No public posts in this collection yet.</p>
      )}
    </div>
  );
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [collection] = await db
    .select({ title: main_schema.collections.title })
    .from(main_schema.collections)
    .where(dorm.eq(main_schema.collections.slug, slug));
  return { title: collection?.title || "Collection not found" };
}
