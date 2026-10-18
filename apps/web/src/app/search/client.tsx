"use client";
import { useQuery } from "@tanstack/react-query";
import PostFilters, { usePostFilters } from "@/components/post-filters";
import { PublicPostsAndVideos } from "@/components/publicPostsAndVideos";

export default function SearchFunction() {
  const filters = usePostFilters();
  const enabled = Boolean(
    filters.query || filters.tag || filters.type !== "all",
  );
  const { data, error, isFetching } = useQuery({
    queryKey: ["searchData", filters],
    enabled,
    queryFn: async ({ signal }) => {
      const response = await fetch(
        `/api/data/search?${new URLSearchParams(filters)}`,
        { signal },
      );
      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error(result.msg || "Search failed");
      return result;
    },
  });
  return (
    <section>
      <h1 className="text-2xl text-center mt-4">Search posts</h1>
      <PostFilters />
      {!enabled && (
        <p className="text-center">Search by text, tag, or post type.</p>
      )}
      {isFetching && (
        <p role="status" className="text-center">
          Searching...
        </p>
      )}
      {error && (
        <p role="alert" className="text-center">
          {error.message}
        </p>
      )}
      {enabled && data?.disabled && (
        <p className="text-center">Search is disabled by the instance owner.</p>
      )}
      {enabled && data && !data.disabled && (
        <>
          <p className="px-4 text-sm text-muted-foreground">
            {data.data.rows.length === 100 ? "First 100 results — narrow your filters to see more" : `${data.data.rows.length} results`} ·{" "}
            {Number(data.queryTime).toFixed(1)} ms
          </p>
          {data.data.rows.length ? (
            <PublicPostsAndVideos mode="search" passedData={data.data.rows} />
          ) : (
            <p className="text-center">No posts match these filters.</p>
          )}
        </>
      )}
    </section>
  );
}
