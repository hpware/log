"use client";
import PostFilters, { usePostFilters } from "./post-filters";
import { PublicPostsAndVideos } from "./publicPostsAndVideos";
import { useSearchParams } from "next/navigation";
import { filtersSchema } from "@/lib/post-validation";

export default function FilteredFeed({ userId }: { userId?: string }) {
  const browse = usePostFilters();
  const params = useSearchParams();
  let filters: { by: "tag"; filter: string }[] = [];
  try {
    const result = filtersSchema.safeParse(
      JSON.parse(params.get("filters") || "[]"),
    );
    if (result.success) filters = result.data;
  } catch {}
  return (
    <>
      <PostFilters />
      <PublicPostsAndVideos
        mode={userId ? "profile" : "index"}
        userInfo={userId}
        passedData={[]}
        filters={filters}
        browse={browse}
      />
    </>
  );
}
