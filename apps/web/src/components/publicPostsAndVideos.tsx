"use client";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import type { main_schema } from "@devlogs_hosting/db";
import Link from "next/link";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import ImageView from "./imageView";
import VideoPlayer from "./video-player";
import PostPreview from "./post-preview";

type Post = typeof main_schema.userPosts.$inferSelect;
export interface FilterFormat {
  by: "tag";
  filter: string;
}
type Browse = {
  query: string;
  tag: string;
  type: "all" | "text" | "photos" | "video";
};
type Hidden = ("profile" | "link" | "profileLink")[];
type FeedPage = { result: Post[]; nextOffset?: number; featDisabled: boolean };

function PostCard({ post, hidden }: { post: Post; hidden?: Hidden }) {
  const [imageOpen, setImageOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const { data: user } = useQuery({
    queryKey: ["publicUser", post.byUser],
    enabled: !hidden?.includes("profile"),
    staleTime: 60000,
    queryFn: async ({ signal }) => {
      const response = await fetch(
        `/api/data/get_user_basic_info/${encodeURIComponent(post.byUser)}`,
        { signal },
      );
      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error("Could not load author");
      return result.content as { name: string; image: string | null };
    },
  });
  return (
    <article className="border shadow rounded break-inside-avoid mb-4 p-2 space-y-2">
      <div className="flex flex-wrap gap-1">
        {(Array.isArray(post.tags) ? post.tags : [])
          .filter((tag): tag is string => typeof tag === "string")
          .map((tag) => (
            <Link
              key={tag}
              href={`/user/${post.byUser}?tag=${encodeURIComponent(tag)}`}
            >
              <Badge>{tag}</Badge>
            </Link>
          ))}
      </div>
      {!hidden?.includes("profile") && (
        <Link
          href={
            hidden?.includes("profileLink")
              ? "/dashboard"
              : `/user/${post.byUser}`
          }
          className="flex items-center gap-2"
        >
          <img
            src={user?.image || "/user/default_pfp.png"}
            alt=""
            className="w-6 h-6 rounded-full"
          />
          <span>{user?.name || "View author"}</span>
        </Link>
      )}
      <PostPreview text={post.textData} />
      {post.type === "photos" &&
        post.imageUrl &&
        (imageFailed ? (
          <p>Image unavailable.</p>
        ) : (
          <button
            type="button"
            aria-label="Expand post image"
            className="w-full"
            onClick={() => setImageOpen(true)}
          >
            <img
              src={post.imageUrl}
              alt={post.textData || "Post image"}
              className="w-full rounded"
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          </button>
        ))}
      {post.type === "video" && post.videoUrl && (
        <VideoPlayer src={post.videoUrl} />
      )}
      {imageOpen && post.imageUrl && (
        <ImageView
          imageSrc={post.imageUrl}
          closeState={() => setImageOpen(false)}
        />
      )}
      {!hidden?.includes("link") && (
        <Link className="text-sm underline block" href={`/i/${post.postId}`}>
          View post
        </Link>
      )}
    </article>
  );
}

export function PublicPostsAndVideos({
  mode,
  passedData,
  userInfo,
  filters,
  browse,
  noDisplay,
}: {
  mode: "index" | "search" | "profile";
  passedData: Post[];
  userInfo?: string;
  filters?: FilterFormat[];
  browse?: Browse;
  noDisplay?: Hidden;
}) {
  const loadMore = useRef<HTMLDivElement>(null);
  const {
    data,
    error,
    status,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["content", mode, userInfo, filters, browse],
    enabled: mode !== "search",
    initialPageParam: 0,
    queryFn: async ({ pageParam, signal }): Promise<FeedPage> => {
      const params = new URLSearchParams({
        offset: String(pageParam),
        ...(browse || {}),
      });
      if (userInfo) params.set("user", userInfo);
      if (filters?.length) params.set("filters", JSON.stringify(filters));
      const response = await fetch(`/api/data/public_data?${params}`, {
        signal,
      });
      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error(result.msg || "Could not load posts");
      return result;
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });
  useEffect(() => {
    if (mode === "search" || !loadMore.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage)
          void fetchNextPage();
      },
      { rootMargin: "200px" },
    );
    observer.observe(loadMore.current);
    return () => observer.disconnect();
  }, [mode, hasNextPage, isFetchingNextPage, fetchNextPage, status]);
  const posts =
    mode === "search"
      ? passedData
      : data?.pages.flatMap((page) => page.result) || [];
  const disabled = data?.pages[0]?.featDisabled;
  return (
    <div>
      {disabled ? (
        <p className="text-center p-4">
          The home feed is disabled by the instance owner.
        </p>
      ) : (
        <>
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 p-4">
            {posts.map((post) => (
              <PostCard key={post.postId} post={post} hidden={noDisplay} />
            ))}
          </div>
          {(mode === "search" || status === "success") && !posts.length && (
            <p className="text-center p-4">No posts match these filters.</p>
          )}
        </>
      )}
      {mode !== "search" && (
        <>
          {status === "pending" && (
            <p role="status" className="text-center">
              Loading posts...
            </p>
          )}
          {error && (
            <div role="alert" className="text-center">
              <p>{error.message}</p>
              <Button onClick={() => void refetch()}>Try again</Button>
            </div>
          )}
          <div ref={loadMore} className="flex justify-center p-4">
            {isFetchingNextPage ? (
              <p role="status">Loading more...</p>
            ) : hasNextPage ? (
              <Button variant="outline" onClick={() => void fetchNextPage()}>
                Load more
              </Button>
            ) : (
              posts.length > 0 && (
                <p className="text-muted-foreground">
                  You have reached the end.
                </p>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
