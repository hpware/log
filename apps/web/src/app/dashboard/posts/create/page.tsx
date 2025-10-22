import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@devlogs_hosting/auth";
import Client from "./client";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }
  return <Client session={session} />;
}
