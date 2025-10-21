"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { main_schema, auth_schema } from "../../../../../../packages/db/src";

type User = typeof auth_schema.user.$inferSelect;

export default function DisplayPosts({
  user,
  isSameUser,
}: {
  user: User;
  isSameUser: boolean;
}) {
  const searchParams = useSearchParams();
  const filters = searchParams.get("filters");
  return (
    <div>
      <span>{JSON.stringify(isSameUser)}</span>
      <span>yes</span>
    </div>
  );
}

function DisplayPost({ user }: { user: User }) {
  return <div></div>;
}
