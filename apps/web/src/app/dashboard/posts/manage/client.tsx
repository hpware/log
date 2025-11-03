"use client";
import { useMemo } from "react";
import { auth_schema } from "../../../../../../../packages/db/src/index";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import Table from "@/components/table";
import { toast } from "sonner";

export default function Client() {
  const submitToServer = useMutation({
    mutationFn: async (data: any) => {
      return;
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

  return (
    <div>
      <Table columns={[]} data={[]} />
    </div>
  );
}
