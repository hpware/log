"use client";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { main_schema } from "../../../../packages/db/src/index";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { CircleUserIcon, ExternalLink } from "lucide-react";

type Post = typeof main_schema.userPosts.$inferSelect;

export function PublicPostsAndVideos() {
  const [currentOffset, setCurrentOffset] = useState(0);
  const [reloadPost, setReloadPost] = useState(false);
  const [logData, setLogData] = useState<Post[]>([]);
  const logUserInfo: {
    id: string | null;
    name: string | null;
    image: string | null;
    banned: boolean;
  }[] = [];
  const checkedUserInfo: string[] = [];
  const fetchData = async ({ pageParam }: { pageParam: any }) => {
    const req = await fetch("/api/data/public_data?offset=" + pageParam);
    const res = await req.json();
    findUserInfo(res);
    return res;
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
  const findUserInfo = (allData: Post[]) => {
    allData.forEach(async (item, index) => {
      if (!checkedUserInfo.includes(item.byUser)) {
        const req = await fetch(`/api/data/get_user_basic_info/${item.byUser}`);
        const res = await req.json();
        checkedUserInfo.push(item.byUser);
        logUserInfo.push(res);
      }
    });
  };
  return (
    <div>
      {status === "success" && (
        <div className="grid">
          {data.pages[0].result.map((i: Post) => (
            <div
              className="border shadow text-wrap flex flex-col rounded"
              key={i.postId}
            >
              <div className="flex flex-row gap-1">
                {(i.tags as string[]).map((it: string) => (
                  <Link
                    key={it}
                    href={`/user/${i.byUser}?filter=by_tag&tag=${it}`}
                  >
                    <Badge variant="default">{it}</Badge>
                  </Link>
                ))}
              </div>
              <Link href={`/user/${i.byUser}`}>
                <CircleUserIcon />
              </Link>
              <span className="break-all">{i.textData}</span>
              <Link href={`/item/${i.postId}`}>
                <ExternalLink></ExternalLink>
              </Link>
              {i.type === "image" ? (
                <Image
                  src={String(i.imageUrl)}
                  alt={`An image that is linked to the post with the caption ${i.textData || "No data"}.`}
                />
              ) : (
                i.type === "video" && <video src={String(i.videoUrl)} />
              )}
            </div>
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
