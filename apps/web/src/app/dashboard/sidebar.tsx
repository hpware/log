"use client";
import {
  Home,
  LogOutIcon,
  PanelTopIcon,
  PlusCircleIcon,
  UsersIcon,
  Sun,
  Moon,
  SettingsIcon,
  InfoIcon,
  CircleArrowLeftIcon,
  LibraryIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useTheme } from "next-themes";
import { useEffect } from "react";

const items = [
  {
    title: "",
    perm: null,
    items: [
      {
        title: "Home",
        url: "/dashboard",
        icon: Home,
      },
      {
        title: "Create Post",
        url: "/dashboard/posts/create",
        icon: PlusCircleIcon,
      },
      {
        title: "Your Account",
        url: "/dashboard/user/account",
        icon: SettingsIcon,
      },
    ],
  },
  {
    title: "Collections",
    perm: null,
    items: [
      {
        title: "Collections",
        url: "/dashboard/collections/",
        icon: LibraryIcon,
      },
      {
        title: "Create Collection",
        url: "/dashboard/collections/create",
        icon: PlusCircleIcon,
      },
    ],
  },
  {
    title: "Administration",
    perm: "admin",
    items: [
      {
        title: "Site Settings",
        url: "/dashboard/settings#site",
        icon: PanelTopIcon,
      },
      {
        title: "Manage Users",
        url: "/dashboard/user/manage_all",
        icon: UsersIcon,
      },
      {
        title: "About this instance",
        url: "/dashboard/settings/about",
        icon: InfoIcon,
      },
    ],
  },
];

export default function DashboardSidebar({
  session,
}: {
  session: typeof authClient.$Infer.Session;
}) {
  const router = useRouter();
  const { setOpenMobile, isMobile } = useSidebar();

  // Auto-close sidebar on mobile when clicking links
  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar className="border-r scrollbar-hide overflow-y-hidden overscroll-y-none no-scrollbar">
      <SidebarHeader className="border-b p-4 scrollbar-hide overflow-y-hidden overscroll-y-none no-scrollbar">
        <div className="flex flex-row justify-between scrollbar-hide">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <Image
                src={session.user.image || "/user/default_pfp.png"}
                width={60}
                height={60}
                alt="Profile Picture"
                className="rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{session.user.name}</span>
              <span className="text-xs text-muted-foreground">
                {session.user.role === "admin" ? "Administrator" : "User"}
              </span>
            </div>
          </div>
          <ModeToggle />
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col overflow-y-hidden overscroll-y-none no-scrollbar">
        {/*New sidebar system */}
        {items.map((masterItem) =>
          (masterItem.perm !== null && session.user.role === masterItem.perm) ||
          masterItem.perm === null ? (
            <SidebarGroup key={masterItem.title}>
              <SidebarGroupLabel>{masterItem.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {masterItem.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.url as Route}
                          onClick={handleLinkClick}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : null,
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu className="space-y-1">
          <SidebarMenuItem>
            <Link href="/">
              <Button
                variant="outline"
                className="w-full justify-start hover:text-outline hover:bg-outline/10 cursor-pointer"
              >
                <CircleArrowLeftIcon className="h-4 w-4" />
                <span>Back Home</span>
              </Button>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button
              variant="outline"
              onClick={() => {
                if (isMobile) {
                  setOpenMobile(false);
                }
                authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push("/");
                    },
                  },
                });
              }}
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            >
              <LogOutIcon className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
