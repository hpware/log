import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import generateId from "./generate_id";

// Initialize S3 client
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

export const s3Config = {
  client: s3Client,
  bucket: process.env.S3_BUCKET_NAME!,
  region: process.env.S3_REGION || "us-east-1",
};

// Generate a unique file name
export function generateFileName(originalName: string): string {
  const extension = originalName.split(".").pop();
  return `uploads/${generateId()}.${extension}`;
}
