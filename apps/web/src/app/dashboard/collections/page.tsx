import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@devlogs_hosting/auth";
import CollectionsClient from "./client";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div>
      <span className="text-lg italic">Collections</span>
      <hr />
      <div className="p-4">
        <CollectionsClient />
      </div>
    </div>
  );
}
