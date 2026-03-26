import type { NextRequest } from "next/server";
import { auth } from "@devlogs_hosting/auth";
import { headers } from "next/headers";
import { getEncodingStatus } from "@/lib/video-encoding";

export const GET = async (request: NextRequest) => {
  try {
    const header = await headers();
    const session = await auth.api.getSession({ headers: header });
    if (!session) {
      return Response.json(
        { success: false, msg: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return Response.json(
        { success: false, msg: "Job ID is required" },
        { status: 400 }
      );
    }

    const status = await getEncodingStatus(jobId);

    if (!status) {
      return Response.json(
        { success: false, msg: "Job not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error("Get encoding status error:", error);
    return Response.json(
      { success: false, msg: error instanceof Error ? error.message : "Failed to get encoding status" },
      { status: 500 }
    );
  }
};