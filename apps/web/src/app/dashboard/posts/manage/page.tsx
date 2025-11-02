import { useMemo } from "react";
import { auth_schema } from "../../../../../../../packages/db/src/index";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import Table from "@/components/table";

export default async function Page() {
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

  return <div>dd</div>;
}
