import { spawn } from "child_process";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { db, dorm, main_schema } from "@devlogs_hosting/db";
import * as schema from "@devlogs_hosting/db/schema/main";
import { Readable } from "stream";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import generateId from "./generate_id";
import { getS3Client } from "./s3";

interface EncodingJob {
  jobId: string;
  sourceUrl: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  errorMessage?: string;
  outputUrl?: string;
}

function getS3Config() {
  return {
    bucket: process.env.S3_BUCKET_NAME!,
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || "auto",
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  };
}

function getS3ClientForEncoding() {
  const config = getS3Config();
  return new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  });
}

export async function createEncodingJob(
  sourceUrl: string,
  userId: string
): Promise<string> {
  const jobId = `encoding_${generateId()}`;
  
  await db.insert(schema.videoEncodingJobs).values({
    jobId,
    sourceUrl,
    status: "pending",
    progress: 0,
  });
  
  triggerEncodingJob(jobId, sourceUrl, userId);
  
  return jobId;
}

async function triggerEncodingJob(jobId: string, sourceUrl: string, userId: string) {
  try {
    await db
      .update(schema.videoEncodingJobs)
      .set({ status: "processing" })
      .where(dorm.eq(schema.videoEncodingJobs.jobId, jobId));
    
    const outputPath = await encodeVideo(sourceUrl, jobId, (progress) => {
      db.update(schema.videoEncodingJobs)
        .set({ progress })
        .where(dorm.eq(schema.videoEncodingJobs.jobId, jobId));
    });
    
    const outputUrl = await uploadEncodedVideo(outputPath, jobId, userId);
    
    await db
      .update(schema.videoEncodingJobs)
      .set({ 
        status: "completed", 
        progress: 100,
        outputUrl,
        completedAt: new Date(),
      })
      .where(dorm.eq(schema.videoEncodingJobs.jobId, jobId));
    
    cleanupTempFiles(outputPath);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    await db
      .update(schema.videoEncodingJobs)
      .set({ 
        status: "failed",
        errorMessage,
      })
      .where(dorm.eq(schema.videoEncodingJobs.jobId, jobId));
  }
}

async function encodeVideo(
  sourceUrl: string,
  jobId: string,
  onProgress: (progress: number) => void
): Promise<string> {
  const tempDir = os.tmpdir();
  const inputPath = path.join(tempDir, `${jobId}_input`);
  const outputPath = path.join(tempDir, `${jobId}_output.mp4`);
  
  try {
    if (sourceUrl.startsWith("/api/data/files/")) {
      const s3Key = sourceUrl.replace("/api/data/files/", "");
      await downloadFromS3(s3Key, inputPath);
    } else {
      throw new Error("Unsupported source URL format");
    }
    
    await runFFmpeg(inputPath, outputPath, onProgress);
    
    return outputPath;
  } catch (error) {
    cleanupTempFiles(inputPath, outputPath);
    throw error;
  }
}

async function downloadFromS3(key: string, localPath: string) {
  const s3Client = getS3ClientForEncoding();
  const config = getS3Config();
  
  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: key,
  });
  
  const response = await s3Client.send(command);
  const stream = response.Body as Readable;
  
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  
  fs.writeFileSync(localPath, Buffer.concat(chunks));
}

async function runFFmpeg(
  inputPath: string,
  outputPath: string,
  onProgress: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-i", inputPath,
      "-c:v", "libx264",
      "-preset", "medium",
      "-crf", "23",
      "-c:a", "aac",
      "-b:a", "128k",
      "-movflags", "+faststart",
      "-progress", "pipe:1",
      "-y",
      outputPath,
    ]);
    
    let duration = 0;
    
    ffmpeg.stderr.on("data", (data) => {
      const output = data.toString();
      const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})/);
      if (durationMatch) {
        const hours = parseInt(durationMatch[1]);
        const minutes = parseInt(durationMatch[2]);
        const seconds = parseInt(durationMatch[3]);
        const centiseconds = parseInt(durationMatch[4]);
        duration = hours * 3600 + minutes * 60 + seconds + centiseconds / 100;
      }
    });
    
    ffmpeg.stdout.on("data", (data) => {
      const output = data.toString();
      const timeMatch = output.match(/out_time_ms=(\d+)/);
      if (timeMatch && duration > 0) {
        const currentTime = parseInt(timeMatch[1]) / 1000000;
        const progress = Math.min(Math.round((currentTime / duration) * 100), 99);
        onProgress(progress);
      }
    });
    
    ffmpeg.on("close", (code) => {
      if (code === 0) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
    
    ffmpeg.on("error", (error) => {
      reject(error);
    });
  });
}

async function uploadEncodedVideo(
  localPath: string,
  jobId: string,
  userId: string
): Promise<string> {
  const s3Client = getS3ClientForEncoding();
  const config = getS3Config();
  
  const s3Key = `encoded/${userId}/${jobId}.mp4`;
  const fileBuffer = fs.readFileSync(localPath);
  
  await s3Client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: "video/mp4",
    })
  );
  
  return `/api/data/files/${s3Key}`;
}

function cleanupTempFiles(...paths: string[]) {
  for (const filePath of paths) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Failed to cleanup temp file: ${filePath}`, error);
    }
  }
}

export async function getEncodingStatus(jobId: string): Promise<EncodingJob | null> {
  const result = await db
    .select()
    .from(schema.videoEncodingJobs)
    .where(dorm.eq(schema.videoEncodingJobs.jobId, jobId))
    .limit(1);
  
  if (result.length === 0) {
    return null;
  }
  
  const job = result[0];
  return {
    jobId: job.jobId,
    sourceUrl: job.sourceUrl,
    outputUrl: job.outputUrl || undefined,
    status: job.status as EncodingJob["status"],
    progress: job.progress,
    errorMessage: job.errorMessage || undefined,
  };
}