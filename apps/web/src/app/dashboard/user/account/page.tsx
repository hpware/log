"use server";
import { auth } from "@devlogs_hosting/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Client from "./client";

export default async function Page() {
  const header = await headers();
  const session = await auth.api.getSession({
    headers: header,
  });
  if (!session) {
    redirect("/login");
  }
  return <Client session={session.user} />;
}
