import Client from "./client";
import {
  db,
  main_schema,
  dorm,
  auth_schema,
} from "../../../../../packages/db/src";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@devlogs_hosting/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect("/dashboard");
  }

  const registerEnabled = await db
    .select()
    .from(main_schema.kvData)
    .where(dorm.eq(main_schema.kvData.key, "registrationStatus"));

  return (
    <Client registerEnabled={String(registerEnabled[0].value) !== "false"} />
  );
}
