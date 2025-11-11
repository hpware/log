import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@devlogs_hosting/auth";
import PostManageClient from "./posts/manage/client";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }
  return (
    <div className="flex flex-col w-full min-w-1/2">
      <span className="text-2xl text-center">
        Welcome back, {session.user.name} 👋
      </span>
      <div>
        <span className="text-lg italic">Your posts</span>
        <PostManageClient />
      </div>
    </div>
  );
}
