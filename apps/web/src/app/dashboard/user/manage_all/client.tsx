"use client";
import { authClient } from "@/lib/auth-client";
import { useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { auth_schema } from "../../../../../../../packages/db/src/index";
import DataTable from "@/components/table";
import { toast } from "sonner";
import {
  User,
  Mail,
  Shield,
  Calendar,
  UserStarIcon,
  MailCheckIcon,
  MailXIcon,
  UserMinusIcon,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Client() {
  const submitToServer = useMutation({
    mutationFn: async () => {
      try {
        const req = await fetch("/api/data/settings?tab=settings", {
          method: "POST",
          headers: {
            "Content-Type": "appilcation/json",
          },
          body: JSON.stringify({
            action: "obtain_toggle_data_for_robotsTxt_and_others",
          }),
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
    const getUsers = await authClient.admin.listUsers({
      query: {
        limit: 50,
        offset: pageParam,
      },
    });
    return {
      data: getUsers.data,
      nextOffset: pageParam + 50,
    };
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

  // Flatten all pages data into a single array
  const flattenedData = useMemo(() => {
    return data?.pages.flatMap((page) => page.data?.users || []) || [];
  }, [data]);

  return (
    <div>
      {flattenedData.length > 0 && (
        <DataTable
          columns={[
            {
              accessorKey: "name",
              header: () => (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Name
                </div>
              ),
              cell: ({ row }) => (
                <div className="flex items-center gap-2">
                  <Image
                    src={row.original.image ?? "/user/default_pfp.png"}
                    alt={`Profile Pic for ${row.getValue("name")}`}
                    width={35}
                    height={35}
                    className={`rounded-full w-6 h-6 ${row.original.banned && "grayscale"}`}
                  />
                  {row.getValue("name") || "N/A"}
                </div>
              ),
            },
            {
              accessorKey: "email",
              header: () => (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
              ),
              cell: ({ row }) => {
                const isVerified = row.original.emailVerified;

                return (
                  <div className="flex items-center gap-2">
                    {isVerified ? (
                      <MailCheckIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <MailXIcon className="h-4 w-4 text-red-500" />
                    )}
                    {row.getValue("email")}
                  </div>
                );
              },
            },
            {
              accessorKey: "role",
              header: () => (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Status
                </div>
              ),
              cell: ({ row }) => (
                <div className="flex items-center gap-2">
                  {row.original.banned ? (
                    <UserMinusIcon className="h-4 w-4" />
                  ) : row.getValue("role") === "admin" ? (
                    <UserStarIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-300" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span>
                    {row.getValue("role")}
                    {row.original.banned && <>- Banned</>}
                  </span>
                </div>
              ),
            },
            {
              accessorKey: "createdAt",
              header: () => (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Created At
                </div>
              ),
              cell: ({ row }) => (
                <div className="flex items-center gap-2">
                  {new Date(row.getValue("createdAt")).toLocaleDateString()}
                </div>
              ),
            },
            {
              accessorKey: "updatedAt",
              header: () => (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Updated At
                </div>
              ),
              cell: ({ row }) => (
                <div className="flex items-center gap-2">
                  {new Date(row.getValue("updatedAt")).toLocaleDateString()}
                </div>
              ),
            },
            {
              accessorKey: "id",
              header: () => <div></div>,
              cell: ({ row }) => (
                <div className="flex items-center gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger>
                      <Button
                        variant="destructive"
                        className="cursor-pointer transition-all duration-300 bg-red-600 hover:bg-red-600/70 dark:bg-red-700 dark:hover:bg-red-300/70 text-white"
                      >
                        Ban User
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action can be undone. This will remove the user's
                          page & login method.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex gap-3 sm:justify-end">
                        <AlertDialogCancel className="mt-0 cursor-pointer transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="cursor-pointer transition-all duration-300 bg-red-600 hover:bg-red-600/70 dark:bg-red-700 dark:hover:bg-red-300/70 text-white"
                          onClick={() => {
                            submitToServer.mutate({
                              action: "ban_user",
                              user: row.original.id,
                            });
                          }}
                        >
                          Ban User
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <AlertDialog>
                    <AlertDialogTrigger>
                      <Button
                        variant="destructive"
                        className="cursor-pointer transition-all duration-300 bg-red-600 hover:bg-red-600/70 dark:bg-red-700 dark:hover:bg-red-300/70 text-white"
                      >
                        Delete User
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete this account and remove this user's data from
                          this instence.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex gap-3 sm:justify-end">
                        <AlertDialogCancel className="mt-0 cursor-pointer transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="cursor-pointer transition-all duration-300 bg-red-600 hover:bg-red-600/70 dark:bg-red-700 dark:hover:bg-red-300/70 text-white"
                          onClick={() => {
                            submitToServer.mutate({
                              action: "ban_user",
                              user: row.original.id,
                            });
                          }}
                        >
                          Delete User
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ),
            },
          ]}
          data={flattenedData}
        />
      )}
    </div>
  );
}
