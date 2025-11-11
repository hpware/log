"use client";
import { useMemo } from "react";
import { auth_schema } from "../../../../../../../packages/db/src/index";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import Table from "@/components/table";
import { toast } from "sonner";
import { ImageIcon, TextInitialIcon, VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Route } from "next";
import Link from "next/link";

export default function Client() {
  const submitToServer = useMutation({
    mutationFn: async (data: any) => {
      try {
        const req = await fetch("/api/data/settings?tab=post_manage", {
          method: "POST",
          headers: {
            "Content-Type": "appilcation/json",
          },
          body: JSON.stringify(data),
        });
        const res = await req.json();
        if (res.success != true) {
          throw new Error(res.msg);
        }
        return;
      } catch (e: any) {
        console.error(e);
        toast.error(`Fetch Failed: ${e.message}`);
      }
    },
  });

  const fetchData = async ({ pageParam }: { pageParam: any }) => {
    try {
      const req = await fetch(`/api/data/all_posts?offset=${pageParam}`);
      const res = await req.json();
      return res;
    } catch (e: any) {
      console.error(e);
      toast.error(e.message);
      return {};
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

  const memoedData = useMemo(() => {
    return data?.pages.flatMap((i) => i.result);
  }, [data]);

  return (
    <div className="max-w-screen">
      <Table
        columns={[
          {
            accessorKey: "type",
            header: () => <div className="flex items-center gap-2">Type</div>,
            cell: ({ row }) => (
              <div className="flex items-center gap-2">
                {row.getValue("type") === "text" ? (
                  <TextInitialIcon className="h-5 w-5" />
                ) : row.getValue("type") === "photos" ? (
                  <ImageIcon className="h-5 w-5" />
                ) : (
                  <VideoIcon className="h-5 w-5" />
                )}
              </div>
            ),
          },
          {
            accessorKey: "textData",
            header: () => <div className="flex items-center gap-2">Text</div>,
            cell: ({ row }) => {
              const text = row.original.textData || "N/A";
              const truncatedText =
                text.length > 50 ? text.substring(0, 50) + "..." : text;

              return (
                <div className="flex items-center gap-2 max-w-xs" title={text}>
                  {truncatedText}
                </div>
              );
            },
          },
          {
            accessorKey: "createdAt",
            header: () => (
              <div className="flex items-center gap-2">Created At</div>
            ),
            cell: ({ row }) => (
              <div className="flex items-center gap-2">
                {new Date(row.getValue("createdAt")).toLocaleString() || "N/A"}
              </div>
            ),
          },
          {
            accessorKey: "postId",
            header: () => <></>,
            cell: ({ row }) => {
              const id = row.getValue("postId");
              return (
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/posts/edit/${id}` as Route}>
                    <Button
                      className="cursor-pointer transition-all duration-300 hover:bg-black/70 dark:hover:bg-gray-200/70"
                      variant="default"
                    >
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    className="cursor-pointer transition-all duration-300 hover:bg-red-600/70 dark:hover:bg-red-300/70"
                    onClick={() =>
                      submitToServer.mutate({
                        action: "",
                        id,
                      })
                    }
                  >
                    Delete
                  </Button>
                </div>
              );
            },
          },
        ]}
        data={memoedData || []}
      />
    </div>
  );
}
