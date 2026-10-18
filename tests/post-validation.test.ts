import { expect, test } from "bun:test";
import {
  canReadPost,
  editSchema,
  filtersSchema,
  publishSchema,
} from "../apps/web/src/lib/post-validation";

test("post visibility allows owners to preview while hiding drafts and private posts", () => {
  for (const status of ["draft", "private"]) {
    const post = { status, byUser: "owner" };
    expect(canReadPost(post)).toBe(false);
    expect(canReadPost(post, "other")).toBe(false);
    expect(canReadPost(post, "owner")).toBe(true);
  }
  for (const status of ["public", "unlisted"])
    expect(canReadPost({ status, byUser: "owner" })).toBe(true);
});
test("publishing rejects missing media, blank text, unsafe URLs, and invalid visibility", () => {
  for (const post of [
    { type: "photos" },
    { type: "video" },
    { type: "text", text: "   " },
    { type: "photos", imageUrl: "javascript:alert(1)" },
    { type: "text", text: "hello", status: "invalid" },
  ])
    expect(publishSchema.safeParse(post).success).toBe(false);
  expect(publishSchema.parse({ type: "text", text: "hello" }).status).toBe(
    "draft",
  );
});
test("edits require matching IDs and well-formed tags", () => {
  const postId = "_ITM" + "a".repeat(20);
  const body = {
    action: "change_post",
    postId,
    postStatus: { postId, status: "public", textData: "hello", tags: ["dev"] },
  };
  expect(editSchema.safeParse(body).success).toBe(true);
  expect(
    editSchema.safeParse({ ...body, postId: "_ITM" + "b".repeat(20) }).success,
  ).toBe(false);
  expect(
    editSchema.safeParse({
      ...body,
      postStatus: { ...body.postStatus, tags: "dev" },
    }).success,
  ).toBe(false);
});
test("tag filters accept arrays and reject malformed entries", () => {
  expect(filtersSchema.safeParse([{ by: "tag", filter: "dev" }]).success).toBe(
    true,
  );
  for (const filters of [{ by: "tag", filter: "dev" }, [[]], [{ by: "tag" }]])
    expect(filtersSchema.safeParse(filters).success).toBe(false);
});
