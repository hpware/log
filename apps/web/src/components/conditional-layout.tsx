"use client";
import { usePathname } from "next/navigation";
import Navigation from "@/components/navigation";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  if (isDashboard) {
    // Dashboard layout - no top nav or footer
    return <>{children}</>;
  }

  // Regular layout with nav and footer
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1 mt-2 mb-12 pb-5 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
