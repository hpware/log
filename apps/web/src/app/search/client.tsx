"use client";
import { Suspense, useEffect, useState } from "react";
import { PublicPostsAndVideos } from "@/components/publicPostsAndVideos";
import type { Metadata } from "next";
import type { FilterFormat } from "@/components/publicPostsAndVideos";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldMinusIcon,
  BotMessageSquareIcon,
  MicroscopeIcon,
  SearchIcon,
  TimerIcon,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function SearchFunction() {
  const [searchBox, setSearchBox] = useState("");
  const [displayingData, setDisplayingData] = useState<any>();
  const [tagFilter, setTagFilter] = useState("");
  const [filters, setFilters] = useState<FilterFormat[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  const paramSearchData = searchParams.get("query");
  const paramFilters = searchParams.get("filters");
  
  useEffect(() => {
    if (paramSearchData !== null) {
      setSearchBox(paramSearchData);
    }
    if (paramFilters !== null) {
      try {
        setFilters(JSON.parse(decodeURIComponent(paramFilters)));
      } catch (e) {
        console.error("Failed to parse filters:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (displayingData !== undefined && searchBox.length > 0) {
      const queryParams = new URLSearchParams();
      if (searchBox) queryParams.set("query", searchBox);
      if (filters.length > 0) queryParams.set("filters", encodeURIComponent(JSON.stringify(filters)));
      router.push(`/search?${queryParams.toString()}`, { scroll: false });
    }
  }, [searchBox, filters]);

  const updateSearchBox = (value: string) => {
    setSearchBox(value);
  };

  const addTagFilter = () => {
    if (tagFilter.trim()) {
      const newFilters = [...filters.filter(f => f.by !== "tag" || f.filter !== tagFilter.trim()), { by: "tag" as const, filter: tagFilter.trim() }];
      setFilters(newFilters);
      setTagFilter("");
    }
  };

  const clearFilters = () => {
    setFilters([]);
  };

  const removeFilter = (idx: number) => {
    setFilters(filters.filter((_, i) => i !== idx));
  };

  const currentSearchBox = searchBox || paramSearchData || "";
  
  const { error, isPending, status } = useQuery({
    queryKey: ["searchData", currentSearchBox, filters],
    queryFn: async () => {
      const query = encodeURIComponent(String(currentSearchBox).trim());
      const filterParam = filters.length > 0 ? `&filters=${encodeURIComponent(JSON.stringify(filters))}` : "";
      const res = await fetch(`/api/data/search?query=${query}${filterParam}`);
      if (!res.ok) throw new Error("Failed to fetch search results");
      const data1 = await res.json();
      setDisplayingData(data1);
      return data1;
    },
    enabled: currentSearchBox.length > 0 || filters.length > 0,
  });

  return (
    <>
      <div
        className={`flex flex-col justify-center ${currentSearchBox.length === 0 && filters.length === 0 && "absolute inset-0"} transition-all duration-300 ease-in-out`}
      >
        {currentSearchBox.length === 0 && filters.length === 0 && (
          <SearchIcon className="justifty-center mx-auto w-12 h-12 transition-all duration-300 ease-in-out" />
        )}
        <span
          className={`text-center justify-center text-2xl font-bold geint-sans transition-all duration-300 ease-in-out ${currentSearchBox.length === 0 && filters.length === 0 ? "mb-4" : "mb-1"}`}
        >
          Search anything!
        </span>
        <div className="flex flex-col gap-2">
          <textarea
            className="border rounded-xl w-[70%] max-w-[500px] justify-center mx-auto px-2 py-1 resize-none overflow-y-hidden overflow-scroll overflow-x-hidden whitespace-nowrap"
            rows={1}
            value={currentSearchBox}
            onChange={(e) => updateSearchBox(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
            autoFocus={searchParams.get("focus") === "1"}
            placeholder="Type anything..."
            disabled={displayingData !== undefined && displayingData.disabled}
          ></textarea>
          <div className="flex flex-row gap-2 items-center justify-center flex-wrap">
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
            <Button variant="outline" size="sm" onClick={addTagFilter}>Add Tag Filter</Button>
            {filters.length > 0 && (
              <Button variant="destructive" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" /> Clear Filters
              </Button>
            )}
          </div>
          {filters.length > 0 && (
            <div className="flex flex-row gap-2 flex-wrap justify-center">
              {filters.map((f, idx) => (
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
        {!error &&
          displayingData &&
          currentSearchBox.length > 0 &&
          !(displayingData !== undefined && displayingData.disabled) && (
            <div>
              <div className="flex flex-row">
                <TimerIcon className="p-1" />
                <span>{Number(displayingData.queryTime).toPrecision(3)}ms</span>
              </div>
            </div>
          )}
      </div>
      <div className="mt-2">
        {(displayingData !== undefined && (currentSearchBox.length > 0 || filters.length > 0)) && (
          <div>
            {displayingData.disabled ? (
              <div>
                <div className="flex flex-col gap-1 absolute inset-0 justify-center text-center">
                  <ShieldMinusIcon className="w-12 h-12 mx-auto mb-3" />
                  <span>
                    The search function is currently disabled by the instance
                    owner.
                  </span>
                </div>
              </div>
            ) : displayingData.data.rows.length > 0 ? (
              <PublicPostsAndVideos
                mode="search"
                passedData={displayingData.data.rows}
                filters={filters}
                key={Number(displayingData.queryTime).toPrecision(10)}
              />
            ) : (
              <div className="flex flex-col md:flex-row gap-1 justify-center text-center align-middle mx-auto">
                <BotMessageSquareIcon className="justify-center text-center xs:mx-auto align-middle xs:text-4xl" />
                <span>
                  Postgres cannot find this content you are looking for.
                </span>
              </div>
            )}
          </div>
        )}
        {status === "error" && currentSearchBox.length > 0 ? (
          <div className="flex flex-col md:flex-row gap-1 justify-center text-center align-middle mx-auto">
            <BotMessageSquareIcon className="justify-center text-center xs:mx-auto align-middle xs:text-4xl" />
            <span>
              {error.message === "Search functionality is currently disabled."
                ? "Search is currently disabled by the administrator."
                : `Error fetching search: ${error.message}`}
            </span>
          </div>
        ) : null}
        {status === "pending" && (currentSearchBox.length > 0 || filters.length > 0) && (
          <div className="justify-center align-center text-center align-middle flex self-center gap-1">
            <Spinner className="justify-center align-center text-center align-middle flex self-center" />
            <span>Loading...</span>
          </div>
        )}
      </div>
    </>
  );
}
