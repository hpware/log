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

async function getAnalyticsSettings() {
  "use server";
  try {
    const umamiEnabled = (
      await db
        .select()
        .from(main_schema.kvData)
        .where(dorm.eq(main_schema.kvData.key, "umamiEnabled"))
    )[0]?.value;
    const umamiScriptUrl = (
      await db
        .select()
        .from(main_schema.kvData)
        .where(dorm.eq(main_schema.kvData.key, "umamiScriptUrl"))
    )[0]?.value;
    const rybbitEnabled = (
      await db
        .select()
        .from(main_schema.kvData)
        .where(dorm.eq(main_schema.kvData.key, "rybbitEnabled"))
    )[0]?.value;
    const rybbitSiteId = (
      await db
        .select()
        .from(main_schema.kvData)
        .where(dorm.eq(main_schema.kvData.key, "rybbitSiteId"))
    )[0]?.value;
    const customScriptsEnabled = (
      await db
        .select()
        .from(main_schema.kvData)
        .where(dorm.eq(main_schema.kvData.key, "customScriptsEnabled"))
    )[0]?.value;
    const customScripts = (
      await db
        .select()
        .from(main_schema.kvData)
        .where(dorm.eq(main_schema.kvData.key, "customScripts"))
    )[0]?.value;
    return {
      umamiEnabled: Boolean(umamiEnabled),
      umamiScriptUrl: String(umamiScriptUrl || ""),
      rybbitEnabled: Boolean(rybbitEnabled),
      rybbitSiteId: String(rybbitSiteId || ""),
      customScriptsEnabled: Boolean(customScriptsEnabled),
      customScripts: String(customScripts || ""),
    };
  } catch {
    return {
      umamiEnabled: false,
      umamiScriptUrl: "",
      rybbitEnabled: false,
      rybbitSiteId: "",
      customScriptsEnabled: false,
      customScripts: "",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const analytics = await getAnalyticsSettings();
  return (
    <html lang="en" suppressHydrationWarning>
      {process.env.NODE_ENV === "development" && (
        <head>
          <script
            crossOrigin="anonymous"
            src="//unpkg.com/react-scan/dist/auto.global.js"
          />
        </head>
      )}
      {analytics.umamiEnabled && analytics.umamiScriptUrl && (
        <head>
          <script
            async
            defer
            data-website-id={analytics.rybbitEnabled ? analytics.rybbitSiteId : undefined}
            src={analytics.umamiScriptUrl}
          />
        </head>
      )}
      {analytics.rybbitEnabled && analytics.rybbitSiteId && (
        <head>
          <script
            async
            defer
            src={`https://cdn.rybbit.io/${analytics.rybbitSiteId}.js`}
          />
        </head>
      )}
      {analytics.customScriptsEnabled && analytics.customScripts && (
        <head>
          <script dangerouslySetInnerHTML={{ __html: analytics.customScripts }} />
        </head>
      )}
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
