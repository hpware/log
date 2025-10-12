"use client";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { main_schema } from "../../../../packages/db/src/index";

export function PublicPostsAndVideos() {
  const [currentOffset, setCurrentOffset] = useState(0);
  const [reloadPost, setReloadPost] = useState(false);
  const [logData, setLogData] = useState<(typeof main_schema.userPosts)[]>([]);
  const fetchData = async ({ pageParam }) => {
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
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  });
  return (
    <div>
      {status === "success" && (
        <div>{JSON.stringify(data.pages[0].result)}</div>
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
        <div className="justify-center align-center text-center align-middle flex self-center">
          <Spinner className="justify-center align-center text-center align-middle flex self-center" />
        </div>
      )}
    </div>
  );
}
