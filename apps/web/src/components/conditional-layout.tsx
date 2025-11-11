"use client";
import { usePathname } from "next/navigation";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

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
      <header className="flex-shrink-0">
        <Navigation />
      </header>
      <main className="flex-1 mt-12 pt-5 overflow-x-hidden">
        {children}
      </main>
      <Footer className="flex-shrink-0" />
    </div>
  );
}
