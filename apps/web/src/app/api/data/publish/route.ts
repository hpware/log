import type { NextRequest } from "next/server";
import { auth } from "@devlogs_hosting/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";

export const POST = async (request: NextRequest) => {
  const body = request.json();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
};
