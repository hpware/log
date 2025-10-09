import type { NextRequest } from "next/server";
import { auth } from "@devlogs_hosting/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";

export const POST = async (request: NextRequest) => {
  const body = request.json();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return Response.json({ s: "s" });
};

/**{
  "session": {
    "session": {
      "expiresAt": "2025-10-16T16:07:17.192Z",
      "token": "8XYESM2csTH0zDau9DzSDYjbhAkgIrNf",
      "createdAt": "2025-10-09T16:07:17.193Z",
      "updatedAt": "2025-10-09T16:07:17.193Z",
      "ipAddress": "127.0.0.1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      "userId": "3OVo0Bq9qX7KPIqBzTw0KzcoA8sS3AA8",
      "id": "OQI4op5pV8f6LA1UM4eWgS8SBMjR7W6X"
    },
    "user": {
      "name": "Howard",
      "email": "hw@yuanhau.com",
      "emailVerified": false,
      "image": null,
      "createdAt": "2025-10-09T16:07:17.046Z",
      "updatedAt": "2025-10-09T16:07:17.046Z",
      "id": "3OVo0Bq9qX7KPIqBzTw0KzcoA8sS3AA8"
    }
  }
} */
