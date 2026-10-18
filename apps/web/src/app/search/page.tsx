import {
  db,
  main_schema,
  dorm,
  auth_schema,
} from "../../../../../packages/db/src";
import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchIcon, TimerIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import SearchFunction from "./client";

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

export const metadata: Metadata = {
  title: "Search",
};
