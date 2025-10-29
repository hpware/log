import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import generateId from "./generate_id";

// Validate required environment variables
function validateS3Config() {
  const required = [
    "S3_ACCESS_KEY_ID",
    "S3_SECRET_ACCESS_KEY",
    "S3_BUCKET_NAME",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required S3 environment variables: ${missing.join(", ")}`,
    );
  }
}

// Validate config on import
validateS3Config();

// Initialize S3 client with better configuration
export const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || "auto",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  // Add retry configuration
  maxAttempts: 3,
  // Force path style for compatibility with some S3 providers
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
});

export const s3Config = {
  client: s3Client,
  bucket: process.env.S3_BUCKET_NAME!,
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
};

// Generate a unique file name with better validation
export function generateFileName(originalName: string): string {
  if (!originalName || typeof originalName !== "string") {
    throw new Error("Invalid original filename provided");
  }

  // Clean the filename and get extension
  const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const extension = cleanName.split(".").pop()?.toLowerCase() || "bin";

  // Validate extension length
  if (extension.length > 10) {
    throw new Error("File extension too long");
  }

  const timestamp = new Date().getTime();
  const randomId = generateId();

  return `uploads/${timestamp}_${randomId}.${extension}`;
}

// Helper function to get signed URL for secure uploads (if needed)
export async function getSignedUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
}
