"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { main_schema, auth_schema } from "../../../../../../packages/db/src";
import Image from "next/image";
import { PublicPostsAndVideos } from "@/components/publicPostsAndVideos";

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
      <PublicPostsAndVideos mode="profile" passedData={[]} userInfo={user.id} />
    </div>
  );
}
