import { auth } from "@devlogs_hosting/auth";
import { db, dorm, main_schema } from "@devlogs_hosting/db";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import CollectionEditor from "../../editor";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const { slug } = await params;
  const [collection] = await db
    .select()
    .from(main_schema.collections)
    .where(
      dorm.and(
        dorm.eq(main_schema.collections.collectionId, slug),
        dorm.eq(main_schema.collections.byUser, session.user.id),
      ),
    );
  if (!collection) notFound();
  const posts = await db
    .select({
      postId: main_schema.userPosts.postId,
      text: main_schema.userPosts.textData,
      type: main_schema.userPosts.type,
      status: main_schema.userPosts.status,
    })
    .from(main_schema.userPosts)
    .where(dorm.eq(main_schema.userPosts.byUser, session.user.id))
    .orderBy(dorm.desc(main_schema.userPosts.createdAt));
  return (
    <CollectionEditor
      collection={{
        collectionId: collection.collectionId,
        title: collection.title,
        slug: collection.slug,
        items: Array.isArray(collection.items)
          ? collection.items.filter(
              (item): item is string =>
                typeof item === "string" &&
                posts.some((post) => post.postId === item),
            )
          : [],
      }}
      posts={posts}
    />
  );
}
