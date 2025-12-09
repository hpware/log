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
import Image from "next/image";
import type { Metadata } from "next";
import { ClockIcon, MailCheckIcon, MailQuestionIcon } from "lucide-react";
import DisplayPosts from "./postDisplay";

type User = typeof auth_schema.user.$inferSelect;

export default async function Page(props: {
  params: Promise<{ userid: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const sessionUserId = session?.session.userId;
  const { userid } = await props.params;
  const content: User[] = await db
    .select()
    .from(auth_schema.user)
    .where(dorm.eq(auth_schema.user.id, userid));

  if (content.length === 0) {
    notFound();
  }
  const isSameUser = sessionUserId === userid ? true : false;

  return (
    <div>
      <div className="flex flex-col pl-2">
        <div className="flex flex-row">
          <Image
            src={
              content[0]?.image !== null
                ? content[0].image
                : "/user/default_pfp.png"
            }
            alt={`The profile picture for ${content[0].name}`}
            width="100"
            height="100"
            className="rounded-full border border-black dark:border-white select-none w-[100px] h-[100px]"
            draggable="false"
          />
          <div className="flex flex-col pl-2 pt-5">
            <span className="text-2xl">{content[0].name}</span>
            <div className="flex flex-row gap-2 text-sm">
              <span className="flex flex-row gap-2 text-sm">
                <ClockIcon className="w-5 h-5" /> Created at{" "}
                {String(new Date(content[0].createdAt).toLocaleDateString())}
              </span>
              {content[0].emailVerified ? (
                <span className="flex flex-row gap-2 text-sm">
                  <MailCheckIcon className="w-5 h-5" /> Email Verified
                </span>
              ) : (
                <span className="flex flex-row gap-2 text-sm">
                  <MailQuestionIcon className="w-5 h-5" /> Email Not Verified
                </span>
              )}
            </div>
            {content[0].banned && (
              <span className="flex flex-row gap-2 text-sm">
                User Banned with reason: {content[0].banReason}
              </span>
            )}
          </div>
        </div>
        <DisplayPosts user={content[0]} isSameUser={isSameUser} />
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userid: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const getUserInfo = await db
    .select()
    .from(auth_schema.user)
    .where(dorm.eq(auth_schema.user.id, resolvedParams.userid));
  if (getUserInfo.length === 0) {
    return {
      title: "Undefined",
    };
  }
  const kvTitle = await db
    .select()
    .from(main_schema.kvData)
    .where(dorm.eq(main_schema.kvData.key, "title"));
  const kvDescription = await db
    .select()
    .from(main_schema.kvData)
    .where(dorm.eq(main_schema.kvData.key, "description"));
  return {
    title: `${getUserInfo[0].name}'s profile ${kvTitle.length !== 0 ? `| ${kvTitle[0].value}` : ""}`,
    description: `${getUserInfo[0].name}'s profile, ${kvDescription.length !== 0 ? kvDescription[0].value : ""}`,
  };
}
