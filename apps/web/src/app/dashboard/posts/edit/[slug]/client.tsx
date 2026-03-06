"use client";

import { PublicPostsAndVideos } from "@/components/publicPostsAndVideos";
import { main_schema } from "../../../../../../../../packages/db/src";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from "@tanstack/react-query";

type Post = typeof main_schema.userPosts.$inferSelect;

export default function Client({ orgPost }: { orgPost: Post }) {
  const [post, setPost] = useState<Post>(orgPost);
  const [tagInput, setTagInput] = useState("");
  const submitRequest = useMutation({
    mutationFn: async () => {
      toast.promise(
        async () => {
          const req = await fetch("/api/data/modify/posts?tab=edit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "change_post",
              postId: post.postId,
              postStatus: post,
            }),
          });
          if (req.status !== 200) {
            throw new Error(req.statusText);
          }
          return;
        },
        {
          loading: "Editing...",
          success: "Edited!",
          error: (error) => `Error editing your post, error: ${error}`,
        },
      );
    },
  });

  const tags = (post.tags as string[]) || [];

  const deleteTag = (tag: string) => {
    setPost({ ...post, tags: tags.filter((t) => t !== tag) });
  };

  const addTag = () => {
    const trimmed = tagInput.replaceAll(" ", "");
    if (trimmed.length === 0) {
      toast.error("This cannot be empty");
      return;
    }
    if (tags.includes(trimmed)) {
      toast.error("This tag is already used in this post.");
      return;
    }
    setPost({ ...post, tags: [...tags, trimmed] });
    setTagInput("");
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="flex flex-col">
        <div>
          <span>Change Visibility</span>
          <Tabs
            defaultValue={post.status}
            className=""
            onValueChange={(vl) => {
              setPost({ ...post, status: vl });
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
        <span>
          tags:
          <input
            type="text"
            value={tagInput}
            maxLength={20}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Space") {
                e.preventDefault();
                addTag();
              }
            }}
          />
        </span>
        <div className="flex flex-row gap-1 flex-wrap">
          {tags.map((it: string) => (
            <button key={it} onClick={() => deleteTag(it)}>
              <Badge
                variant="default"
                className="hover:bg-red-500 hover:text-white hover:line-through justify-center text-center transition-all duration-300"
              >
                {it}
              </Badge>
            </button>
          ))}
        </div>
        <textarea
          className="border shadow rounded mt-2 p-1 ml-1 resize-none h-[200px]"
          value={post.textData || ""}
          onChange={(e) => setPost({ ...post, textData: e.target.value })}
        />
        <div className="justify-between flex flex-row mr-3 mt-2">
          <div></div>
          <Button
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
