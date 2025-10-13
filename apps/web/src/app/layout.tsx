import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../index.css";
import Providers from "@/components/providers";
import Navigation from "@/components/navigation";
import { db, main_schema, dorm } from "../../../../packages/db/src";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const titleResult = await db
      .select()
      .from(main_schema.kvData)
      .where(dorm.eq(main_schema.kvData.key, "title"));

    const descResult = await db
      .select()
      .from(main_schema.kvData)
      .where(dorm.eq(main_schema.kvData.key, "description"));

    const title = `${titleResult[0]?.value ?? ""}`;
    const description = `${descResult[0]?.value ?? ""}`;

    return {
      title,
      description,
    };
  } catch (e) {
    console.error(e);
    return {
      title: `Home`,
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="grid grid-rows-[auto_1fr] h-svh">
            <header>
              <Navigation />
            </header>
            <main className="mt-12 pt-5 min-h-screen">{children}</main>
            <footer></footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
