import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@devlogs_hosting/auth";
import { authClient } from "@/lib/auth-client";
import * as Cc from "./clientComponents";
import {
  db,
  main_schema,
  dorm,
  auth_schema,
} from "../../../../../../packages/db/src";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }
  const kvTitle = await db
    .select()
    .from(main_schema.kvData)
    .where(dorm.eq(main_schema.kvData.key, "title"));
  const kvDescription = await db
    .select()
    .from(main_schema.kvData)
    .where(dorm.eq(main_schema.kvData.key, "description"));

  return (
    <div className="ml-4">
      <Cc.ChangeSiteSettings
        serverTitleData={String(kvTitle[0].value || "")}
        serverDescriptionData={String(kvDescription[0].value || "")}
      />
    </div>
  );
}
