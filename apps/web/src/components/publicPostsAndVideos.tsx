"use client";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { useEffect, useState, useRef } from "react";
import { Spinner } from "@/components/ui/spinner";
import { main_schema } from "../../../../packages/db/src/index";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "./ui/badge";
import ImageView from "./imageView";
import {
  CircleUserIcon,
  ExternalLink,
  MegaphoneOffIcon,
  ShieldMinusIcon,
  ImageOff,
  VideoOff,
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
  const [imageViewSys, setImageViewSys] = useState({
    previewOn: false,
    previewImageUrl: "",
  });
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
        finalFilter = `&filters=${encodeURIComponent(JSON.stringify(filters))}`;
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

  const pullUserInfo = async (data: Post[]) => {
    for (const item of data) {
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

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["content", mode, userInfo, filters],
    queryFn: fetchData,
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => lastPage.nextOffset,
  });
  const findUserInfo = async (allData: {
    msg: string;
    nextOffset: number;
    result: Post[];
    success: true;
  }) => {
    await pullUserInfo(allData.result);
  };

  useEffect(() => {
    if (mode === "search" && passedData.length !== 0) {
      pullUserInfo(passedData);
    }
  }, [passedData]);

  // Intersection observer ref for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode !== "index" && mode !== "profile") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, mode]);

  return (
    <div>
      {imageViewSys.previewOn && (
        <ImageView
          imageSrc={imageViewSys.previewImageUrl}
          closeState={() =>
            setImageViewSys({ previewOn: false, previewImageUrl: "" })
          }
        />
      )}
      {mode === "search" ? (
        <>
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 p-4">
            {passedData.map((i: Post) => (
              <div
                className="border shadow text-wrap flex flex-col rounded break-inside-avoid mb-4"
                key={crypto.randomUUID()}
              >
                <div className="flex flex-row gap-1">
                  {(i.tags as string[]).map((it: string) => (
                    <Link
                      key={crypto.randomUUID()}
                      href={`/user/${i.byUser}?filters=${encodeURIComponent(JSON.stringify({ by: "tag", filter: it }))}`}
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
                <div className="p-2">
                  <span className="break-words">{i.textData}</span>
                </div>
                {i.type === "photos" ? (
                  <button
                    className="w-full overflow-hidden"
                    onClick={() => {
                      setImageViewSys({
                        previewOn: true,
                        previewImageUrl: String(i.imageUrl),
                      });
                    }}
                  >
                    <img
                      src={String(i.imageUrl)}
                      className="w-full h-auto rounded border"
                      alt={`An image that is linked to the post with the caption ${i.textData || "No data"}.`}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fallback =
                          e.currentTarget.parentElement?.querySelector(
                            ".image-fallback",
                          ) as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                    <div className="image-fallback hidden w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 flex-col items-center justify-center text-gray-500 rounded">
                      <ImageOff className="w-8 h-8 mb-2" />
                      <p className="text-sm text-center">
                        Sorry, we can't display this image right now
                      </p>
                    </div>
                  </button>
                ) : (
                  i.type === "video" && (
                    <div className="w-full overflow-hidden">
                      <video
                        src={String(i.videoUrl)}
                        controls
                        className="w-full h-auto rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback =
                            e.currentTarget.parentElement?.querySelector(
                              ".video-fallback",
                            ) as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                      <div className="video-fallback hidden w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 flex-col items-center justify-center text-gray-500 rounded">
                        <VideoOff className="w-8 h-8 mb-2" />
                        <p className="text-sm text-center">
                          Sorry, we can't play this video right now
                        </p>
                      </div>
                    </div>
                  )
                )}
                {!noDisplay?.includes("link") && (
                  <Link href={`/i/${i.postId}`}>
                    <ExternalLink />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </>
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
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 p-4">
                {data.pages
                  .flatMap((page) => page.result || [])
                  .map((i: Post) => (
                    <div
                      className="border shadow text-wrap flex flex-col rounded dark:border-gray-100/50 p-2 break-inside-avoid mb-4"
                      key={crypto.randomUUID()}
                    >
                      <div className="grid grid-flow-col-dense auto-cols-max gap-2 overflow-x-auto pb-1">
                        {(i.tags as string[]).map((it: string) => (
                          <Link
                            key={crypto.randomUUID()}
                            href={`/user/${i.byUser}?filters=${encodeURIComponent(JSON.stringify({ by: "tag", filter: it }))}`}
                            className="whitespace-nowrap overflow-hidden text-ellipsis block"
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
                      <div className="mb-2">
                        <span className="break-words">{i.textData}</span>
                      </div>
                      {i.type === "photos" ? (
                        <button
                          className="w-full overflow-hidden"
                          onClick={() => {
                            setImageViewSys({
                              previewOn: true,
                              previewImageUrl: String(i.imageUrl),
                            });
                          }}
                        >
                          {" "}
                          <img
                            src={String(i.imageUrl)}
                            className="w-full h-auto rounded border"
                            alt={`An image that is linked to the post with the caption ${i.textData || "No data"}.`}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const fallback =
                                e.currentTarget.parentElement?.querySelector(
                                  ".image-fallback",
                                ) as HTMLElement;
                              if (fallback) fallback.style.display = "flex";
                            }}
                          />
                          <div className="image-fallback hidden w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 flex-col items-center justify-center text-gray-500 rounded">
                            <ImageOff className="w-8 h-8 mb-2" />
                            <p className="text-sm text-center">
                              Sorry, we can't display this image right now
                            </p>
                          </div>
                        </button>
                      ) : (
                        i.type === "video" && (
                          <div className="w-full overflow-hidden">
                            <video
                              src={String(i.videoUrl)}
                              controls
                              className="w-full h-auto rounded border"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const fallback =
                                  e.currentTarget.parentElement?.querySelector(
                                    ".video-fallback",
                                  ) as HTMLElement;
                                if (fallback) fallback.style.display = "flex";
                              }}
                            />
                            <div className="video-fallback hidden w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 flex-col items-center justify-center text-gray-500 rounded">
                              <VideoOff className="w-8 h-8 mb-2" />
                              <p className="text-sm text-center">
                                Sorry, we can't play this video right now
                              </p>
                            </div>
                          </div>
                        )
                      )}
                      <Link href={`/i/${i.postId}`}>
                        <ExternalLink />
                      </Link>
                    </div>
                  ))}
              </div>
            )}

            {status === "success" && (
              <div ref={loadMoreRef} className="flex justify-center mt-6 mb-6">
                {isFetchingNextPage ? (
                  <div className="flex items-center gap-2">
                    <Spinner className="w-4 h-4" />
                    <span>Loading more...</span>
                  </div>
                ) : !hasNextPage && !data?.pages?.[0]?.featDisabled ? (
                  <span className="text-gray-500">
                    You have scrolled to the bottom
                  </span>
                ) : null}
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
