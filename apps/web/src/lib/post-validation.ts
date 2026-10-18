import { z } from "zod";

export const postIdSchema = z.string().regex(/^_ITM[A-Za-z0-9]{20}$/);
export const tagsSchema = z.array(z.string().trim().min(1).max(100)).max(50);
export const postStatusSchema = z.enum([
  "draft",
  "private",
  "public",
  "unlisted",
]);
const mediaUrl = z.string().refine((value) => {
  if (value.startsWith("/api/data/files/"))
    return !value.includes("?") && !value.includes("#");
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}, "Invalid media URL");
export const publishSchema = z
  .object({
    type: z.enum(["text", "photos", "video"]),
    text: z.string().max(100000).default(""),
    status: postStatusSchema.default("draft"),
    tags: tagsSchema.default([]),
    imageUrl: mediaUrl.optional(),
    videoUrl: mediaUrl.optional(),
    collectionId: z.string().min(1).optional(),
  })
  .superRefine((post, ctx) => {
    if (
      (post.type === "photos" && !post.imageUrl) ||
      (post.type === "video" && !post.videoUrl) ||
      (post.type === "text" && !post.text.trim())
    ) {
      ctx.addIssue({ code: "custom", message: "Post content is required" });
    }
  });
export const editSchema = z
  .object({
    action: z.literal("change_post"),
    postId: postIdSchema,
    postStatus: z.object({
      postId: postIdSchema,
      status: postStatusSchema,
      textData: z.string().max(100000).nullable(),
      tags: tagsSchema,
    }),
  })
  .refine(
    (body) => body.postId === body.postStatus.postId,
    "Post IDs must match",
  );

export const filtersSchema = z
  .array(z.object({ by: z.literal("tag"), filter: z.string().min(1).max(100) }))
  .max(50);

export function canReadPost(
  post: { status: string; byUser: string },
  userId?: string,
) {
  return (
    post.status === "public" ||
    post.status === "unlisted" ||
    post.byUser === userId
  );
}

export const browseSchema = z.object({
  query: z.string().trim().max(500).default(""),
  tag: z.string().trim().max(100).default(""),
  type: z.enum(["all", "text", "photos", "video"]).default("all"),
});
