import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import generateId from "./generate_id";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const s3Config = {
  client: s3Client,
  bucket: process.env.S3_BUCKET_NAME!,
  region: process.env.AWS_REGION || "us-east-1",
};

// Generate a unique file name
export function generateFileName(originalName: string): string {
  const extension = originalName.split(".").pop();
  return `uploads/${generateId()}.${extension}`;
}

// Get content type from file extension
export function getContentType(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    mp4: "video/mp4",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    pdf: "application/pdf",
    txt: "text/plain",
  };
  return mimeTypes[extension || ""] || "application/octet-stream";
}
