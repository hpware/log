"use client";
import { authClient } from "@/lib/auth-client";
import { useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { auth_schema } from "../../../../../../../packages/db/src/index";
import DataTable from "@/components/table";
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
import Image from "next/image";

export function Client() {
  const submitToServer = useMutation({
    mutationFn: async (data: any) => {
      return;
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
                    <UserStarIcon className="h-4 w-4" />
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
                  <Button
                    onClick={() => {
                      submitToServer.mutate({
                        action: "ban_user",
                        user: row.original.id,
                      });
                    }}
                  >
                    Ban User
                  </Button>
                  <Button
                    onClick={() => {
                      submitToServer.mutate({
                        action: "delete_user",
                        user: row.original.id,
                      });
                    }}
                  >
                    Delete User
                  </Button>
                </div>
              ),
            },
          ]}
          data={flattenedData}
        />
      )}
      {JSON.stringify(flattenedData)}
    </div>
  );
}
