"use client";
import { authClient } from "@/lib/auth-client";
import { useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { auth_schema } from "../../../../../../../packages/db/src/index";
import DataTable from "@/components/table";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Input } from "@/components/ui/input";

export function Client() {
  const [banReasons, setBanReasons] = useState<Record<string, string>>({});
  const submitToServer = useMutation({
    mutationFn: async (sendData: any) => {
      try {
        const req = await fetch("/api/data/settings?tab=admin_user_actions", {
          method: "POST",
          headers: {
            "Content-Type": "appilcation/json",
          },
          body: JSON.stringify(sendData),
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
      <span className="italic text-lg">Manage Users</span>
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
                    className="rounded-full w-6 h-6"
                    style={{
                      filter: row.original.banned ? "grayscale(100%)" : "none",
                    }}
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
                    <UserMinusIcon className="h-4 w-4 text-red-600 dark:text-red-500" />
                  ) : row.getValue("role") === "admin" ? (
                    <UserStarIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-300" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  {row.original.banned ? (
                    <span className="text-red-600 dark:text-red-500">
                      banned
                    </span>
                  ) : (
                    <span>{row.getValue("role")}</span>
                  )}
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="cursor-pointer transition-all duration-300 bg-red-600 hover:bg-red-600/70 dark:bg-red-700 dark:hover:bg-red-300/70 text-white"
                      >
                        Ban User
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                      </DialogHeader>
                      <span>Ban Reason</span>
                      <Input
                        type="text"
                        value={banReasons[row.original.id] || ""}
                        onChange={(e) => 
                          setBanReasons(prev => ({
                            ...prev,
                            [row.original.id]: e.target.value
                          }))
                        }
                      />
                      <DialogDescription className="flex flex-col">
                        <span>
                          This action can be undone. This will remove the user's
                          page & login method.
                        </span>
                      </DialogDescription>
                      <DialogFooter className="flex gap-3 sm:justify-end">
                        <DialogClose asChild>
                          <Button variant="outline" className="cursor-pointer">
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          className="cursor-pointer transition-all duration-300 bg-red-600 hover:bg-red-600/70 dark:bg-red-700 dark:hover:bg-red-300/70 text-white"
                          onClick={() => {
                            submitToServer.mutate({
                              action: "ban_user",
                              user: row.original.id,
                              reason: banReasons[row.original.id] || "",
                            });
                            setBanReasons(prev => {
                              const newReasons = { ...prev };
                              delete newReasons[row.original.id];
                              return newReasons;
                            });
                          }}
                        >
                          Ban User
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
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
                              action: "delete_user",
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
