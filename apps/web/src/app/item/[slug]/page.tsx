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
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

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
  const getUserInfo = await db
    .select()
    .from(auth_schema.user)
    .where(dorm.eq(auth_schema.user.id, content[0].byUser));

  return (
    <div>
      <div className="flex flex-col">
        {content[0].type === "video" && content[0].videoUrl !== null && (
          <div>
            <video src={content[0].videoUrl} />
          </div>
        )}
        {content[0].type === "photos" && content[0].imageUrl !== null && (
          <div>
            <img
              src={content[0].imageUrl}
              alt={`An image uploaded by ${getUserInfo[0].name} ${content[0].textData && `with the caption ${content[0].textData}`}`}
            />
          </div>
        )}
        <div>{content[0].textData ?? ""}</div>
        <div className="flex flex-row gap-1">
          {(content[0].tags as string[]).map((it: string) => (
            <Link
              key={it}
              href={`/user/${content[0].byUser}?filter=by_tag&tag=${it}`}
            >
              <Badge variant="default">{it}</Badge>
            </Link>
          ))}
        </div>
        <div className="flex flex-row">
          <Link
            className="flex flex-row gap-1 transition-all duration-300 hover:text-gray-200/80"
            href={`/user/${getUserInfo[0].id}`}
          >
            <Image
              src={
                getUserInfo[0]?.image !== null
                  ? getUserInfo[0].image
                  : "/user/default_pfp.png"
              }
              alt={`The profile picture for ${getUserInfo[0].name}`}
              width="20"
              height="20"
              className="ml-2 p-1 w-6 h-6 rounded-full border-black dark:border-white select-none"
              draggable="false"
            />
            <span>{getUserInfo[0].name}</span>
          </Link>
          <DotIcon />
          <div className="flex flex-row">
            <CalendarPlusIcon className="p-1" />{" "}
            <span>{new Date(content[0].createdAt).toLocaleString()}</span>
          </div>
          <DotIcon />
          <div className="flex flex-row">
            <CalendarSyncIcon className="p-1" />{" "}
            <span>{new Date(content[0].updatedAt).toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div>{JSON.stringify(content)}</div>
    </div>
  );
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
    title: `A post by ${getUserInfo[0].name} | ${kvTitle.length !== 0 ? kvTitle[0].value : ""}`,
    description: `A post by ${getUserInfo[0].name}, and published at ${content[0].updatedAt}. ${kvDescription.length !== 0 ? kvDescription[0].value : ""}`,
  };
}
