import { auth } from "@devlogs_hosting/auth";
import { db, dorm, main_schema } from "@devlogs_hosting/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Collections from "./client";

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const collections = await db
    .select({
      collectionId: main_schema.collections.collectionId,
      title: main_schema.collections.title,
      slug: main_schema.collections.slug,
    })
    .from(main_schema.collections)
    .where(dorm.eq(main_schema.collections.byUser, session.user.id));
  return <Collections initial={collections} />;
}
