"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { main_schema, auth_schema } from "../../../../../../packages/db/src";
import Image from "next/image";
import { PublicPostsAndVideos } from "@/components/publicPostsAndVideos";
import type { FilterFormat } from "@/components/publicPostsAndVideos";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type User = typeof auth_schema.user.$inferSelect;
type postType = typeof main_schema.userPosts.$inferSelect;

export default function DisplayPosts({
  user,
  isSameUser,
}: {
  user: User;
  isSameUser: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filtersParam = searchParams.get("filters");
  const [tagFilter, setTagFilter] = useState("");
  const [textFilter, setTextFilter] = useState("");
  
  let parsedResult: FilterFormat[] | null = [];
  const isValidFilterObject = (arr: any): arr is FilterFormat[] => {
    return Array.isArray(arr) && arr.every((item) => 
      typeof item === 'object' && 
      item !== null &&
      'by' in item && 
      (item.by === 'tag' || item.by === 'text') &&
      'filter' in item && 
      typeof item.filter === 'string'
    );
  };
  try {
    if (filtersParam !== null) {
      const parsed = JSON.parse(String(filtersParam));
      if (!isValidFilterObject(parsed)) {
        throw new Error("ERR_FILTER_NOT_VALID_JSON");
      }
      parsedResult = parsed;
    }
  } catch (e: any) {
    console.error("Filter is not valid json!");
    toast.error("Filter is not valid json!");
  }

  const updateFilters = (newFilters: FilterFormat[]) => {
    if (newFilters.length > 0) {
      router.push(`?filters=${encodeURIComponent(JSON.stringify(newFilters))}`);
    } else {
      router.push("");
    }
  };

  const addTagFilter = () => {
    if (tagFilter.trim()) {
      const newFilters = [...parsedResult.filter(f => f.by !== "tag" || f.filter !== tagFilter.trim()), { by: "tag" as const, filter: tagFilter.trim() }];
      updateFilters(newFilters);
      setTagFilter("");
    }
  };

  const addTextFilter = () => {
    if (textFilter.trim()) {
      const newFilters = [...parsedResult.filter(f => f.by !== "text" || f.filter !== textFilter.trim()), { by: "text" as const, filter: textFilter.trim() }];
      updateFilters(newFilters);
      setTextFilter("");
    }
  };

  const clearFilters = () => {
    updateFilters([]);
    setTagFilter("");
    setTextFilter("");
  };

  const removeFilter = (idx: number) => {
    updateFilters(parsedResult.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div className="p-4 flex flex-col gap-2 border-b">
        <div className="flex flex-row gap-2 items-center flex-wrap">
          <input
            type="text"
            placeholder="Filter by tag..."
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTagFilter();
              }
            }}
            className="border rounded px-2 py-1 max-w-[150px]"
          />
          <Button variant="outline" size="sm" onClick={addTagFilter}>Add Tag</Button>
          <input
            type="text"
            placeholder="Filter by text..."
            value={textFilter}
            onChange={(e) => setTextFilter(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTextFilter();
              }
            }}
            className="border rounded px-2 py-1 max-w-[150px]"
          />
          <Button variant="outline" size="sm" onClick={addTextFilter}>Add Text</Button>
          {parsedResult.length > 0 && (
            <Button variant="destructive" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" /> Clear
            </Button>
          )}
        </div>
        {parsedResult.length > 0 && (
          <div className="flex flex-row gap-2 flex-wrap items-center">
            <span className="text-sm text-gray-500">Active:</span>
            {parsedResult.map((f, idx) => (
              <div key={idx} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm flex items-center gap-1">
                {f.by}: {f.filter}
                <button onClick={() => removeFilter(idx)} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <PublicPostsAndVideos
        mode="profile"
        passedData={[]}
        userInfo={user.id}
        filters={parsedResult || []}
      />
    </div>
  );
}
