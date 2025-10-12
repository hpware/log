"use client";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { main_schema } from "../../../../packages/db/src/index";
import Link from "next/link";
import Image from "next/image";

type Post = typeof main_schema.userPosts.$inferSelect;

export function PublicPostsAndVideos() {
  const [currentOffset, setCurrentOffset] = useState(0);
  const [reloadPost, setReloadPost] = useState(false);
  const [logData, setLogData] = useState<Post[]>([]);
  const fetchData = async ({ pageParam }: { pageParam: any }) => {
    const res = await fetch("/api/data/public_data?offset=" + pageParam);
    return res.json();
  };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["content"],
    queryFn: fetchData,
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => lastPage.nextOffset,
  });
  return (
    <div>
      {status === "success" && (
        <div className="grid">
          {data.pages[0].result.map((i: Post) => (
            <Link
              href={`/item/${i.postId}`}
              className="border shadow text-wrap"
            >
              <span className="break-all">{i.textData}</span>
              {i.type === "image" ? (
                <Image
                  src={String(i.imageUrl)}
                  alt={`An image that is linked to the post with the caption ${i.textData || "No data"}.`}
                />
              ) : (
                i.type === "video" && <video src={String(i.videoUrl)} />
              )}
            </Link>
          ))}
        </div>
      )}

      {status === "error" ? (
        <div>
          <span>Error fetching new posts: {error.message}</span>
          <Button
            variant="outline"
            onClick={() => {
              setReloadPost((prev) => !prev);
            }}
          >
            Try again
          </Button>
        </div>
      ) : null}
      {status === "pending" && (
        <div className="justify-center align-center text-center align-middle flex self-center gap-1">
          <Spinner className="justify-center align-center text-center align-middle flex self-center" />
          <span>Loading...</span>
        </div>
      )}
    </div>
  );
}
