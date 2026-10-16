"use client";
import { useSearchParams } from "next/navigation";
import { PublicPostsAndVideos } from "@/components/publicPostsAndVideos";
import { filtersSchema } from "@/lib/post-validation";

export default function DisplayPosts({
  user,
}: {
  user: { id: string };
  isSameUser: boolean;
}) {
  const searchParams = useSearchParams();
  let filters: { by: "tag"; filter: string }[] = [];
  try {
    const result = filtersSchema.safeParse(
      JSON.parse(searchParams.get("filters") || "[]"),
    );
    if (result.success) filters = result.data;
  } catch {}
  return (
    <PublicPostsAndVideos
      mode="profile"
      passedData={[]}
      userInfo={user.id}
      filters={filters}
    />
  );
}
