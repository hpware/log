import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@devlogs_hosting/auth";
import CollectionDetailClient from "./client";

export default async function Page({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const { collectionId } = await params;

  return <CollectionDetailClient collectionId={collectionId} session={session} />;
}