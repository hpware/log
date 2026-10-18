import { auth } from "@devlogs_hosting/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { main_schema, db, dorm } from "../../../../../../../../packages/db/src";
import Client from "./client";
import type { Metadata } from "next";

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const { slug } = await props.params;
  const pullPost = await db
    .select()
    .from(main_schema.userPosts)
    .where(
      dorm.and(
        dorm.eq(main_schema.userPosts.postId, slug),
        dorm.eq(main_schema.userPosts.byUser, session.user.id),
      ),
    );
  if (!pullPost[0]) notFound();
  return <Client orgPost={pullPost[0]} />;
}

export const metadata: Metadata = {
  title: "Edit a post",
};
