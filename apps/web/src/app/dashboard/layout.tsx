import type { Metadata } from "next";
import Providers from "@/components/providers";
import Navigation from "@/components/navigation";
import { db, main_schema, dorm } from "../../../../../packages/db/src";

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
    <div className="grid grid-rows-[auto_1fr] h-svh">
      <main className="mt-12 pt-5 min-h-screen">{children}</main>
    </div>
  );
}
