"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Spinner } from "./ui/spinner";
import { useRouter } from "next/navigation";
import * as React from "react";
import { ModeToggle } from "./mode-toggle";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  HouseIcon,
  LayoutDashboardIcon,
  LogInIcon,
  LogOutIcon,
  Moon,
  SearchIcon,
  Sun,
  UserIcon,
} from "lucide-react";
export default function Navigation() {
  const queryClient = useQueryClient();
  const querySystemData = useQuery({
    queryFn: async () => {
      const req = await fetch("/api/data/system_info");
      const res = await req.json();
      return res;
    },
    queryKey: ["system_info"],
  });
  return (
    <div className="flex flex-col fixed bottom-0 inset-x-0 justify-center text-center items-center align-middle z-50 mb-1">
      <div className="flex flex-col mb-2 bg-gray-50/10 backdrop-blur-xl mx-auto justify-center text-center align-middle p-3 rounded-lg pb-1">
        <div className="flex flex-row items-center gap-2 my-0 py-0 justify-center">
          <Link href="/">
            <Button
              variant="outline"
              size="icon"
              className="cursor-pointer"
              aria-label="Home"
              /**              disabled={
  querySystemData.isLoading
    ? false
    : querySystemData.data?.feature_status.home !== true
} */
            >
              <HouseIcon />
            </Button>
          </Link>
          <Link href="/search">
            <Button
              variant="outline"
              size="icon"
              className="cursor-pointer"
              aria-label="Search"
              /**              disabled={
  querySystemData.isLoading
    ? false
    : querySystemData.data?.feature_status.search !== true
} */
            >
              <SearchIcon />
            </Button>
          </Link>
          <ModeToggle />
          <UserMenu />
        </div>
        <span className="text-sm mt-1">
          &copy; {new Date().getFullYear()}{" "}
          {querySystemData.data?.copyright_owner || ""}{" "}
          {querySystemData.data?.optionalExposeVersion === true
            ? `| v${querySystemData.data?.version}`
            : null}
        </span>
      </div>
    </div>
  );
}

function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="cursor-pointer"
        aria-label="Loading..."
      >
        <Spinner />
      </Button>
    );
  }

  if (!session) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="cursor-pointer"
        aria-label="Login"
        asChild
      >
        <Link href="/login">
          <LogInIcon />
        </Link>
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="cursor-pointer"
        aria-label="Dashboard"
        onClick={() => router.push("/dashboard")}
      >
        <LayoutDashboardIcon />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="cursor-pointer"
        aria-label="Profile"
        onClick={() => router.push(`/user/${session.user.id}`)}
      >
        <UserIcon />
      </Button>
      <Button
        size="icon"
        className="cursor-pointer"
        variant="outline"
        aria-label="Logout"
        onClick={() => {
          authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                router.push("/");
              },
            },
          });
        }}
      >
        <LogOutIcon />
      </Button>
    </>
  );
}
