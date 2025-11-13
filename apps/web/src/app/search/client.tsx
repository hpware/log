"use client";
import { Suspense, useEffect, useState } from "react";
import { PublicPostsAndVideos } from "@/components/publicPostsAndVideos";
import type { Metadata } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldMinusIcon,
  BotMessageSquareIcon,
  MicroscopeIcon,
  SearchIcon,
  TimerIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function SearchFunction() {
  const [searchBox, setSearchBox] = useState("");
  const [displayingData, setDisplayingData] = useState<any>();
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
  const { error, isPending, status } = useQuery({
    queryKey: ["searchData", String(searchBox)],
    queryFn: async () => {
      const query = encodeURIComponent(String(searchBox).trim());
      const res = await fetch(`/api/data/search?query=${query}`);
      if (!res.ok) throw new Error("Failed to fetch search results");
      const data1 = await res.json();
      setDisplayingData(data1);
      return data1;
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
          autoFocus={searchParams.get("focus") === "1"}
          placeholder="Type anything..."
          disabled={displayingData !== undefined && displayingData.disabled}
        ></textarea>
        {!error &&
          displayingData &&
          searchBox.length > 0 &&
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
        {displayingData !== undefined && searchBox.length > 0 && (
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
        {status === "error" && searchBox.length > 0 ? (
          <div className="flex flex-col md:flex-row gap-1 justify-center text-center align-middle mx-auto">
            <BotMessageSquareIcon className="justify-center text-center xs:mx-auto align-middle xs:text-4xl" />
            <span>
              {error.message === "Search functionality is currently disabled."
                ? "Search is currently disabled by the administrator."
                : `Error fetching search: ${error.message}`}
            </span>
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
