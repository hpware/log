import type { NextRequest } from "next/server";
import { auth } from "@devlogs_hosting/auth";
import { headers } from "next/headers";
import * as s3 from "@/lib/s3";

export const POST = async (request: NextRequest) => {
  try {
    const header = await headers();
    const session = await auth.api.getSession({ headers: header });
    if (!session) {
      throw new Error("ERR_NOT_LOGGED_IN");
    }
    const body = await request.formData();
    const s3Client = s3.s3Client;
  } catch (e: any) {
    console.error(e);
    return Response.json(
      { success: false, msg: e.message, result: [] },
      {
        status: 500,
        statusText: e.message,
      },
    );
  }
};
