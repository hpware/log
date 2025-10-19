import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@devlogs_hosting/auth";
import { authClient } from "@/lib/auth-client";
import * as Cc from "./clientComponents";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="ml-4">
      <Cc.ChangeSiteSettings />
    </div>
  );
}
