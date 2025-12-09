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
import { useTheme } from "next-themes";
export default function Navigation() {
  return (
    <div className="flex flex-col fixed bottom-0 inset-x-0 justify-center text-center items-center align-middle z-50 mb-1">
      <div className="flex flex-col mb-2 bg-gray-50/10 backdrop-blur-xl mx-auto justify-center text-center align-middle p-3 rounded-lg pb-1">
        <div className="flex flex-row items-center gap-2 my-0 py-0">
          <Link href="/">
            <Button
              variant="outline"
              size="icon"
              className="cursor-pointer"
              aria-label="Home"
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
            >
              <SearchIcon />
            </Button>
          </Link>
          <ModeToggle />
          <UserMenu />
        </div>
        <span className="text-sm mt-1">&copy; {new Date().getFullYear()} </span>
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
