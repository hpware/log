import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@devlogs_hosting/auth";
import projectData from "@/../projectData";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }
  if (session.user?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="ml-4 space-y-4">
      You are using hpware/log v{projectData.version}, and node version{" "}
      {process.version}
    </div>
  );
}
