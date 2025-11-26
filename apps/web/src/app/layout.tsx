import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  //Roboto_Condensed,
  Archivo_Black,
} from "next/font/google";
import "../index.css";
import Providers from "@/components/providers";
import ConditionalLayout from "@/components/conditional-layout";
import { db, main_schema, dorm } from "../../../../packages/db/src";
import { headers } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/*const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  subsets: ["latin"],
}); */

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: "400",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${archivoBlack.variable} antialiased`}
      >
        <Providers>
          <ConditionalLayout>{children}</ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
