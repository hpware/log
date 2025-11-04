"use client";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { main_schema } from "../../../../packages/db/src/index";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "./ui/badge";
import {
  CircleUserIcon,
  ExternalLink,
  MegaphoneOffIcon,
  ShieldMinusIcon,
} from "lucide-react";
import { truncate } from "fs/promises";
import { toast } from "sonner";

type Post = typeof main_schema.userPosts.$inferSelect;

export function PublicPostsAndVideos({
  mode,
  passedData,
  userInfo,
  filters,
  noDisplay,
}: {
  mode: "index" | "search" | "profile";
  passedData: Post[];
  userInfo?: string;
  filters?: FilterFormat[];
  noDisplay?: ("profile" | "link" | "profileLink")[];
}) {
  const [currentOffset, setCurrentOffset] = useState(0);
  const [reloadPost, setReloadPost] = useState(false);
  const [logData, setLogData] = useState<Post[]>([]);
  const [logUserInfo, setLogUserInfo] = useState<
    {
      id: string | null;
      name: string | null;
      image: string | null;
      banned: boolean;
    }[]
  >([]);
  const checkedUserInfo: string[] = [];
  const fetchData = async ({ pageParam }: { pageParam: any }) => {
    if (mode === "index") {
      const req = await fetch("/api/data/public_data?offset=" + pageParam);
      const res = await req.json();
      findUserInfo(res);
      return res;
    } else if (mode === "profile") {
      if (userInfo === undefined) {
        return {
          offset: 0,
        };
      }
      let finalFilter = "";
      if (filters !== undefined) {
        finalFilter = `&filters=${JSON.stringify(filters)}`;
      }
      const req = await fetch(
        "/api/data/public_data?offset=" +
          pageParam +
          "&user=" +
          String(userInfo) +
          String(finalFilter),
      );
      const res = await req.json();
      findUserInfo(res);
      return res;
    } else {
      return {
        offset: 0,
      };
    }
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
  const findUserInfo = async (allData: {
    msg: String;
    nextOffset: Number;
    result: Post[];
    success: true;
  }) => {
    for (const item of allData.result) {
      if (!checkedUserInfo.includes(item.byUser)) {
        try {
          const req = await fetch(
            `/api/data/get_user_basic_info/${item.byUser}`,
          );
          const res = await req.json();
          if (!res.success) {
            throw new Error("ERR_FAIL");
            return;
          }
          setLogUserInfo((prev) => [...prev, res.content]);
          console.log(logUserInfo);
          checkedUserInfo.push(item.byUser);
        } catch (error: any) {
          console.error(`Failed to fetch user ${item.byUser}:`, error);
          toast.error(`Failed to fetch user details: ${error.message}`);
        }
      }
    }
  };
  return (
    <div>
      {mode === "search" ? (
        <div>
          {passedData.map((i: Post) => (
            <div
              className="border shadow text-wrap flex flex-col rounded"
              key={crypto.randomUUID()}
            >
              <div className="flex flex-row gap-1">
                {(i.tags as string[]).map((it: string) => (
                  <Link
                    key={crypto.randomUUID()}
                    href={`/user/${i.byUser}?filter=by_tag&tag=${it}`}
                  >
                    <Badge variant="default">{it}</Badge>
                  </Link>
                ))}
              </div>
              {!noDisplay?.includes("profile") && (
                <Link
                  href={
                    !noDisplay?.includes("profileLink")
                      ? `/user/${i.byUser}`
                      : "/dashboard"
                  }
                >
                  <UserData
                    userId={i.byUser}
                    logUserInfo={logUserInfo}
                    key={`${i.byUser}-${logUserInfo.length}`}
                  />
                </Link>
              )}
              <span className="break-all">{i.textData}</span>
              {!noDisplay?.includes("link") && (
                <Link href={`/item/${i.postId}`}>
                  <ExternalLink />
                </Link>
              )}
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
      ) : (
        (mode === "index" || mode === "profile") && (
          <div>
            {data?.pages?.[0]?.featDisabled && (
              <div className="flex flex-col gap-1 absolute inset-0 justify-center text-center">
                <ShieldMinusIcon className="w-12 h-12 mx-auto mb-3" />
                <span>
                  The home page function is currently disabled by the instance
                  owner.
                </span>
              </div>
            )}
            {status === "success" && data.pages?.[0]?.result !== undefined && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {(data.pages?.[0]?.result || []).map((i: Post) => (
                  <div
                    className="border shadow text-wrap flex flex-col rounded m-1 dark:border-gray-100/50 p-2"
                    key={crypto.randomUUID()}
                  >
                    <div className="flex flex-row gap-1">
                      {(i.tags as string[]).map((it: string) => (
                        <Link
                          key={crypto.randomUUID()}
                          href={`/user/${i.byUser}?filter=by_tag&tag=${it}`}
                        >
                          <Badge variant="default">{it}</Badge>
                        </Link>
                      ))}
                    </div>
                    <Link href={`/user/${i.byUser}`}>
                      <UserData
                        userId={i.byUser}
                        logUserInfo={logUserInfo}
                        key={`${i.byUser}-${logUserInfo.length}`}
                      />
                    </Link>
                    <span className="break-all">{i.textData}</span>
                    <Link href={`/item/${i.postId}`}>
                      <ExternalLink />
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
        )
      )}
    </div>
  );
}

export function UserData({
  userId,
  logUserInfo,
}: {
  userId: string;
  logUserInfo: {
    id: string | null;
    name: string | null;
    image: string | null;
    banned: boolean;
  }[];
}) {
  const user = logUserInfo.find((it) => it.id === userId);
  if (!user) {
    return (
      <div className="flex flex-row gap-1">
        <Spinner className="justify-center align-center text-center align-middle flex self-center w-6 h-6 p-1" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-1">
      <Image
        src={user.image || "/user/default_pfp.png"}
        alt={`${user.name || "User"}'s profile picture`}
        width={35}
        height={35}
        className="rounded-full w-6 h-6"
      />
      <span>{user.name || "Unknown user"}</span>
    </div>
  );
}
export interface FilterFormat {
  by: "tag";
  filter: string;
}
