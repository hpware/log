import {
  db,
  main_schema,
  dorm,
  auth_schema,
} from "../../../../../packages/db/src";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@devlogs_hosting/auth";
import { headers } from "next/headers";
import type { Metadata } from "next";

export default async function Page() {
  return <div>Search anything! </div>;
}
