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
import { CalendarPlusIcon, CalendarSyncIcon, DotIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import Client from "./client";

export const dynamic = "force-dynamic";

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.session.userId;
  const { slug } = await props.params;
  const content: (typeof main_schema.collections.$inferSelect)[] = await db
    .select()
    .from(main_schema.collections)
    .where(dorm.eq(main_schema.userPosts.postId, slug));

  if (content.length === 0) {
    notFound();
  }

  const getUserInfo = await db
    .select()
    .from(auth_schema.user)
    .where(dorm.eq(auth_schema.user.id, content[0].byUser));

  return (
    <Client
      data={{
        userInfo: {
          id: getUserInfo[0].id,
          name: getUserInfo[0].name,
          image: getUserInfo[0].image,
        },
        slug: content[0].id,
        title: content[0].title,
        createdAt: content[0].createdAt,
        updatedAt: content[0].updatedAt,
      }}
    />
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const content: (typeof main_schema.collections.$inferSelect)[] = await db
    .select()
    .from(main_schema.collections)
    .where(dorm.eq(main_schema.userPosts.postId, resolvedParams.slug));

  if (content.length === 0) {
    return {
      title: "Undefined",
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
    title: `A collection by ${getUserInfo[0].name} | ${kvTitle.length !== 0 ? kvTitle[0].value : ""}`,
    description: `A collection by ${getUserInfo[0].name}, and published at ${content[0].updatedAt}. ${kvDescription.length !== 0 ? kvDescription[0].value : ""}`,
  };
}
