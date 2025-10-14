import {
  db,
  main_schema,
  dorm,
  auth_schema,
} from "../../../../../../packages/db/src";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@devlogs_hosting/auth";
import { headers } from "next/headers";
import type { Metadata } from "next";

type Post = typeof main_schema.userPosts.$inferSelect;

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.session.userId;
  const { slug } = await props.params;
  const content: Post[] = await db
    .select()
    .from(main_schema.userPosts)
    .where(
      dorm.and(
        dorm.eq(main_schema.userPosts.postId, slug),
        dorm.ne(main_schema.userPosts.status, "draft"),
      ),
    );

  if (content.length === 0) {
    notFound();
  }

  if (content[0].status === "private" && content[0].byUser !== userId) {
    notFound();
  }

  return <div>{JSON.stringify(content)}</div>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const content: Post[] = await db
    .select()
    .from(main_schema.userPosts)
    .where(dorm.eq(main_schema.userPosts.postId, resolvedParams.slug));
  if (content.length === 0) {
    return {
      title: "Unknown",
    };
  }
  const getUserInfo = await db
    .select()
    .from(auth_schema.user)
    .where(dorm.eq(auth_schema.user.id, content[0].byUser));
  const kvTitle = await db
    .select()
    .from(main_schema.kvData)
    .where(dorm.eq(main_schema.kvData.key, "title"));
  const kvDescription = await db
    .select()
    .from(main_schema.kvData)
    .where(dorm.eq(main_schema.kvData.key, "description"));
  return {
    title: `A post by ${getUserInfo[0].name} | ${kvTitle.length !== 0 ? kvTitle[0].value : ""}`,
    description: `A post by ${getUserInfo[0].name}, and published at ${content[0].updatedAt}. ${kvDescription.length !== 0 ? kvDescription[0].value : ""}`,
  };
}
