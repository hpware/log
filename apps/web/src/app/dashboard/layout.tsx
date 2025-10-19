import type { Metadata } from "next";
import Providers from "@/components/providers";
import Navigation from "@/components/navigation";
import { db, main_schema, dorm } from "../../../../../packages/db/src";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard-sidebar";

export const metadata: Metadata = {
  title: "Home",
  description: "The home of ",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
