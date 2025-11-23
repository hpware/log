"use client";
import { useMemo } from "react";
import { auth_schema } from "../../../../../../../packages/db/src/index";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import Table from "@/components/table";
import { toast } from "sonner";
import { ImageIcon, TextInitialIcon, VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Route } from "next";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Client() {
  const queryClient = useQueryClient();
  const submitToServer = useMutation({
    mutationFn: async (data: any) => {
      try {
        const req = await fetch("/api/data/modify/posts?tab=post_manage", {
          method: "POST",
          headers: {
            "Content-Type": "appilcation/json",
          },
          body: JSON.stringify(data),
        });
        const res = await req.json();
        if (!req.ok) {
          throw new Error(res.msg);
        }
        toast.success("This post is deleted");
        return;
      } catch (e: any) {
        console.error(e);
        toast.error(`Fetch Failed: ${e.message}`);
      }
    },
    // on success then refresh the page (this should also be applied somewhere as well)
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
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
        key="manage_page_DO_NOT_CRASH"
        columns={[
          {
            accessorKey: "type",
            header: () => <div className="flex items-center gap-2">Type</div>,
            cell: ({ row }) => {
              if (!row || !row.original)
                return <div className="flex items-center gap-2">N/A</div>;
              const type = row.getValue("type");
              return (
                <div className="flex items-center gap-2">
                  {type === "text" ? (
                    <TextInitialIcon className="h-5 w-5" />
                  ) : type === "photos" ? (
                    <ImageIcon className="h-5 w-5" />
                  ) : (
                    <VideoIcon className="h-5 w-5" />
                  )}
                </div>
              );
            },
          },
          {
            accessorKey: "textData",
            header: () => <div className="flex items-center gap-2">Text</div>,
            cell: ({ row }) => {
              if (!row || !row.original)
                return <div className="flex items-center gap-2">N/A</div>;
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
            cell: ({ row }) => {
              if (!row || !row.original)
                return <div className="flex items-center gap-2">N/A</div>;
              return (
                <div className="flex items-center gap-2">
                  {new Date(row.getValue("createdAt")).toLocaleString() ||
                    "N/A"}
                </div>
              );
            },
          },
          {
            accessorKey: "postId",
            header: () => <></>,
            cell: ({ row }) => {
              if (!row || !row.original)
                return <div className="flex items-center gap-2">N/A</div>;
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="cursor-pointer transition-all duration-300 hover:bg-red-600/70 dark:hover:bg-red-300/70"
                      >
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete this post from this instance.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="cursor-pointer transition-all duration-300 bg-red-600 text-white hover:bg-red-600/70 dark:hover:bg-red-300/70"
                          onClick={() => {
                            submitToServer.mutate({
                              action: "delete_post",
                              postId: row.original.postId,
                            });
                          }}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
