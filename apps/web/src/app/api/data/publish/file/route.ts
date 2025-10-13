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
      throw new Error("ERR_NOT_LOGGED_IN");
    }
    const body = await request.formData();
    const file = body.get("file") as File; // Extract the file from FormData

    if (!file) {
      throw new Error("No file provided");
    }

    if (
      process.env.UPLOAD_LIMIT !== undefined &&
      process.env.UPLOAD_LIMIT.length !== 0
    ) {
      const maxSizeInBytes = Number(process.env.UPLOAD_LIMIT) * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        throw new Error(
          `File size too large. Maximum allowed size is ${process.env.UPLOAD_LIMIT}MB.`,
        );
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer()); // Convert to buffer

    const s3Client = s3.s3Client;
    const fsName = s3.generateFileName(file.name);
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: fsName,
        Body: buffer,
        ContentType: file.type,
      },
    });
    await upload.done();
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
