"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { main_schema, auth_schema } from "../../../../../../packages/db/src";
import Image from "next/image";

type User = typeof auth_schema.user.$inferSelect;
type postType = typeof main_schema.userPosts.$inferSelect;

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
      <span>
        {JSON.stringify({
          userInfo: user,
          isSameUser: isSameUser,
          filters: filters,
        })}
      </span>
    </div>
  );
}

function DisplayPost({ user, postData }: { user: User; postData: postType }) {
  return (
    <div>
      <div className="flex flex-row gap-1">
        <Image
          src={String(user.image)}
          width={30}
          height={30}
          alt={`Profile picture for ${user.name}`}
          className="w-6 h-6"
        />
        <span>{user.name}</span>
      </div>
    </div>
  );
}
