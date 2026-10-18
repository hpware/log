"use client";

import { PublicPostsAndVideos } from "@/components/publicPostsAndVideos";
import type { main_schema } from "../../../../../../../../packages/db/src";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from "@tanstack/react-query";

type Post = typeof main_schema.userPosts.$inferSelect;

export default function Client({ orgPost }: { orgPost: Post }) {
  const [post, setPost] = useState<Post>(orgPost);
  const [savedStatus, setSavedStatus] = useState(orgPost.status);
  const submitRequest = useMutation({
    mutationFn: async () => {
      const req = await fetch("/api/data/modify/posts?tab=edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_post",
          postId: post.postId,
          postStatus: post,
        }),
      });
      const result = await req.json();
      if (!req.ok) throw new Error(result.message || "Failed to edit post");
    },
    onSuccess: () => {
      setSavedStatus(post.status);
      toast.success("Post saved");
    },
    onError: (error) => toast.error(error.message),
  });
  return (
    <div className="flex flex-col md:flex-row">
      <div className="flex flex-col">
        <div>
          <span>Change Visibility</span>
          <Tabs
            defaultValue={post.status}
            className=""
            onValueChange={(vl) => {
              setPost({
                postId: post.postId,
                type: post.type,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                byUser: post.byUser,
                textData: post.textData,
                imageUrl: post.imageUrl,
                videoUrl: post.videoUrl,
                status: vl,
                tags: post.tags,
              });
            }}
          >
            <TabsList>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="private">Private</TabsTrigger>
              <TabsTrigger value="unlisted">Link-only</TabsTrigger>
              <TabsTrigger value="public">Public</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <textarea
          aria-label="Post text"
          className="border shadow rounded mt-2 p-1 ml-1 resize-none h-[200px]"
          value={post.textData || ""}
          onChange={(e) =>
            setPost({
              postId: post.postId,
              type: post.type,
              createdAt: post.createdAt,
              updatedAt: post.updatedAt,
              byUser: post.byUser,
              textData: e.target.value,
              imageUrl: post.imageUrl,
              videoUrl: post.videoUrl,
              status: post.status,
              tags: post.tags,
            })
          }
        />
        <label className="mt-2">
          Tags (comma separated)
          <input
            className="border rounded p-1 block"
            defaultValue={(post.tags as string[]).join(", ")}
            onChange={(event) =>
              setPost((prev) => ({
                ...prev,
                tags: event.target.value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              }))
            }
          />
        </label>
        <div className="justify-between flex flex-row mr-3 mt-2">
          <Button
            variant="outline"
            disabled={
              submitRequest.isPending ||
              !["public", "unlisted"].includes(savedStatus)
            }
            onClick={async () => {
              try {
                const response = await fetch("/api/data/create_share_link", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ postId: post.postId }),
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message);
                await navigator.clipboard.writeText(
                  new URL(result.url, window.location.origin).href,
                );
                toast.success("Share link copied");
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Could not copy link",
                );
              }
            }}
          >
            Copy share link
          </Button>
          <Button
            disabled={submitRequest.isPending}
            variant="outline"
            onClick={() => submitRequest.mutate()}
            className="cursor-pointer"
          >
            Submit
          </Button>
        </div>
      </div>
      <div>
        <span></span>
        <PublicPostsAndVideos mode="search" passedData={[post]} />
      </div>
    </div>
  );
}
