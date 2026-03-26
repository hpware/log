import type { NextRequest } from "next/server";
import { auth } from "@devlogs_hosting/auth";
import { headers } from "next/headers";
import { createEncodingJob } from "@/lib/video-encoding";

export const POST = async (request: NextRequest) => {
  try {
    const header = await headers();
    const session = await auth.api.getSession({ headers: header });
    if (!session) {
      return Response.json(
        { success: false, msg: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sourceUrl } = body;

    if (!sourceUrl) {
      return Response.json(
        { success: false, msg: "Source URL is required" },
        { status: 400 }
      );
    }

    const jobId = await createEncodingJob(sourceUrl, session.user.id);

    return Response.json({
      success: true,
      jobId,
      msg: "Encoding job created",
    });
  } catch (error) {
    console.error("Create encoding job error:", error);
    return Response.json(
      { success: false, msg: error instanceof Error ? error.message : "Failed to create encoding job" },
      { status: 500 }
    );
  }
};