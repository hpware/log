import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@devlogs_hosting/auth";
import Client from "./client";
import type { Metadata } from "next";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }
  return <Client session={session} />;
}

export const metadata: Metadata = {
  title: "Create a new post",
};
