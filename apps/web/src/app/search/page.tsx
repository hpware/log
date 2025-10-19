"use client";
import { Suspense, useEffect, useState } from "react";
import type { Metadata } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center absolute inset-0 transition-all duration-300 ease-in-out">
          <SearchIcon className="justifty-center mx-auto w-12 h-12 transition-all duration-300 ease-in-out" />
          <span className="text-center justify-center text-2xl font-bold geint-sans transition-all duration-300 ease-in-out mb-4">
            Search anything!
          </span>
          <Skeleton className="border rounded-xl w-[70%] max-w-[500px] justify-center mx-auto px-2 py-1 resize-none overflow-y-hidden overflow-scroll overflow-x-hidden whitespace-nowrap"></Skeleton>
        </div>
      }
    >
      <SearchFunction />
    </Suspense>
  );
}

function SearchFunction() {
  const [searchBox, setSearchBox] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const paramSearchData = searchParams.get("query");
  useEffect(() => {
    if (paramSearchData !== null) {
      setSearchBox(paramSearchData);
    }
  }, []);
  const updateSearchBox = (value: string) => {
    setSearchBox(value);
    if (value.length !== 0) {
      router.push(`/search?query=${value.replaceAll(" ", "+")}`);
    } else {
      router.push("/search");
    }
  };
  const { data, error, isPending, status } = useQuery({
    queryKey: ["searchData", String(searchBox)],
    queryFn: async () => {
      const query = encodeURIComponent(String(searchBox).trim());
      const res = await fetch(`/api/data/search?query=${query}`);
      if (!res.ok) throw new Error("Failed to fetch search results");
      return await res.json();
    },
    enabled: searchBox.length > 0,
  });
  return (
    <>
      <div
        className={`flex flex-col justify-center ${searchBox.length === 0 && "absolute inset-0"} transition-all duration-300 ease-in-out`}
      >
        {searchBox.length === 0 && (
          <SearchIcon className="justifty-center mx-auto w-12 h-12 transition-all duration-300 ease-in-out" />
        )}
        <span
          className={`text-center justify-center text-2xl font-bold geint-sans transition-all duration-300 ease-in-out ${searchBox.length === 0 ? "mb-4" : "mb-1"}`}
        >
          Search anything!
        </span>
        <textarea
          className="border rounded-xl w-[70%] max-w-[500px] justify-center mx-auto px-2 py-1 resize-none overflow-y-hidden overflow-scroll overflow-x-hidden whitespace-nowrap"
          rows={1}
          value={searchBox}
          onChange={(e) => updateSearchBox(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
          placeholder="Type anything..."
        ></textarea>
      </div>
      <div className="mt-2">
        {JSON.stringify(data)}{" "}
        {status === "error" && searchBox.length > 0 ? (
          <div>
            <span>Error fetching search: {error.message}</span>
          </div>
        ) : null}
        {status === "pending" && searchBox.length > 0 && (
          <div className="justify-center align-center text-center align-middle flex self-center gap-1">
            <Spinner className="justify-center align-center text-center align-middle flex self-center" />
            <span>Loading...</span>
          </div>
        )}
      </div>
    </>
  );
}
