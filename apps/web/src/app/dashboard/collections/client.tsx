"use client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import type { Route } from "next";
import { Button } from "@/components/ui/button";

export default function CollectionsClient() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const req = await fetch("/api/data/get_all_collections");
      const res = await req.json();
      if (!req.ok) {
        throw new Error(res.message || "Failed to fetch collections");
      }
      return res.data as {
        collectionId: string;
        slug: string;
        title: string;
      }[];
    },
  });

  if (error) {
    toast.error(error.message);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link href={"/dashboard/collections/create" as Route}>
          <Button>Create Collection</Button>
        </Link>
      </div>
      {isLoading && <p className="text-gray-500">Loading collections...</p>}
      {data && data.length === 0 && (
        <p className="text-gray-500 italic">
          No collections yet. Create one to get started.
        </p>
      )}
      {data && data.length > 0 && (
        <div className="flex flex-col gap-2">
          {data.map((collection) => (
            <div
              key={collection.collectionId}
              className="border rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <h3 className="font-medium">{collection.title}</h3>
                <p className="text-sm text-gray-500">/{collection.slug}</p>
              </div>
              <Link
                href={`/c/${collection.slug}` as Route}
              >
                <Button variant="outline">View</Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
