"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { main_schema, auth_schema } from "../../../../../../packages/db/src";
import Image from "next/image";
import { PublicPostsAndVideos } from "@/components/publicPostsAndVideos";
import type { FilterFormat } from "@/components/publicPostsAndVideos";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type User = typeof auth_schema.user.$inferSelect;
type postType = typeof main_schema.userPosts.$inferSelect;

export default function DisplayPosts({
  user,
  isSameUser,
}: {
  user: User;
  isSameUser: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = searchParams.get("filters");
  let parsedResult: FilterFormat[] | null = [];
  const isValidFilterObject = (arr: any): arr is FilterFormat[] => {
    return Array.isArray(arr) && arr.every((item) => isValidFilterObject(item));
  };
  try {
    if (filters !== null) {
      const parsed = JSON.parse(String(filters));
      if (isValidFilterObject(parsed)) {
        throw new Error("ERR_FILTER_NOT_VALID_JSON");
      }
      parsedResult = parsed;
    }
  } catch (e) {
    console.error("Filter is not valid json!");
    toast.error("Filter is not valid json!");
  }

  return (
    <div>
      <span>
        {JSON.stringify({
          isSameUser: isSameUser,
          filters: parsedResult,
        })}
      </span>
      <PublicPostsAndVideos
        mode="profile"
        passedData={[]}
        userInfo={user.id}
        filters={parsedResult || []}
      />
    </div>
  );
}
