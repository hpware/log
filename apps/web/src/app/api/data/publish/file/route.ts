import type { NextRequest } from "next/server";
import { auth } from "@devlogs_hosting/auth";
import { headers } from "next/headers";
import * as s3 from "@/lib/s3";
import { Upload } from "@aws-sdk/lib-storage";
import { db, main_schema, dorm } from "../../../../../../../../packages/db/src";

export const POST = async (request: NextRequest) => {
  try {
    const header = await headers();
    const session = await auth.api.getSession({ headers: header });
    if (!session) {
      return Response.json(
        { success: false, msg: "Authentication required", uploadUrl: "" },
        { status: 401 },
      );
    }

    const body = await request.formData();
    const file = body.get("file") as File;

    if (!file) {
      return Response.json(
        { success: false, msg: "No file provided", uploadUrl: "" },
        { status: 400 },
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (!allowedTypes.includes(file.type)) {
      return Response.json(
        { success: false, msg: "File type not allowed", uploadUrl: "" },
        { status: 400 },
      );
    }

    // Validate file size
    const uploadLimit = process.env.UPLOAD_LIMIT || "50"; // Default 50MB
    const maxSizeInBytes = Number(uploadLimit) * 1024 * 1024;

    if (file.size > maxSizeInBytes) {
      return Response.json(
        {
          success: false,
          msg: `File size too large. Maximum allowed size is ${uploadLimit}MB.`,
          uploadUrl: "",
        },
        { status: 413 },
      );
    }

    // Validate required environment variables
    if (!process.env.S3_BUCKET_NAME) {
      console.error("S3_BUCKET_NAME environment variable is not set");
      return Response.json(
        { success: false, msg: "Server configuration error", uploadUrl: "" },
        { status: 500 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fsName = s3.generateFileName(file.name);

    console.log(
      `Uploading file: ${file.name} as ${fsName} (${file.size} bytes)`,
    );

    const upload = new Upload({
      client: s3.s3Client,
      params: {
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: fsName,
        Body: buffer,
        ContentType: file.type,
        Metadata: {
          originalName: file.name,
          uploadedBy: session.user.id,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    const result = await upload.done();
    console.log(`Successfully uploaded: ${fsName}`);

    return Response.json({
      success: true,
      msg: "File uploaded successfully",
      uploadUrl: `/api/data/${fsName}`,
      fileSize: file.size,
      contentType: file.type,
    });
  } catch (e: any) {
    console.error("Upload error:", e);

    // Handle specific S3 errors
    if (e.name === "AccessDenied" || e.Code === "AccessDenied") {
      return Response.json(
        {
          success: false,
          msg: "S3 access denied. Check credentials.",
          uploadUrl: "",
        },
        { status: 403 },
      );
    }

    if (e.name === "NoSuchBucket" || e.Code === "NoSuchBucket") {
      return Response.json(
        {
          success: false,
          msg: "S3 bucket not found. Check configuration.",
          uploadUrl: "",
        },
        { status: 500 },
      );
    }

    if (e.name === "NetworkingError") {
      return Response.json(
        {
          success: false,
          msg: "Network error. Please try again.",
          uploadUrl: "",
        },
        { status: 503 },
      );
    }

    return Response.json(
      { success: false, msg: e.message || "Upload failed", uploadUrl: "" },
      { status: 500 },
    );
  }
};
