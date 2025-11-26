import type { NextRequest } from "next/server";
import * as s3 from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";

type Props = {
  params: Promise<{
    slug: string[];
  }>;
};

export const GET = async (request: NextRequest, context: Props) => {
  try {
    // Check if S3 is configured
    if (!s3.s3Config.isConfigured) {
      return new Response(
        JSON.stringify({ error: "S3 storage not configured" }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const { slug } = await context.params;
    let buildUrl: string = "";
    for (let i = 0; i < slug.length; i++) {
      buildUrl += slug[i];
      if (i < slug.length - 1) {
        buildUrl += "/";
      }
    }
    const finalBuildUrl = buildUrl; // makeing it a static value

    const response = await s3.s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: finalBuildUrl,
      }),
    );
    // Check if the response body exists
    if (!response.Body) {
      return new Response(JSON.stringify({ error: "File content not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Convert the stream to a buffer
    const chunks: Uint8Array[] = [];
    const reader = response.Body.transformToWebStream().getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    // Combine all chunks into a single buffer
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const buffer = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }

    // Return the file with proper headers
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": response.ContentType || "application/octet-stream",
        "Content-Length":
          response.ContentLength?.toString() || buffer.length.toString(),
        "Cache-Control": "public, max-age=31536000", // Cache for 1 year
        ETag: response.ETag || "",
        ...(response.LastModified && {
          "Last-Modified": response.LastModified.toUTCString(),
        }),
      },
    });
  } catch (e: any) {
    console.error(e);
    return Response.json(
      { trace: e, failback: "500 Server Error" },
      {
        status: e.status || 500,
        statusText: e.statusText || "Server Error",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};
