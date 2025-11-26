// THIS REALLY NEEDS TO BE DONE :(
"use client";

import { PublicPostsAndVideos } from "@/components/publicPostsAndVideos";
import { main_schema, db, dorm } from "../../../../../../../../packages/db/src";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from "@tanstack/react-query";

type Post = typeof main_schema.userPosts.$inferSelect;

export default function Client({ orgPost }: { orgPost: Post }) {
  const [post, setPost] = useState<Post>(orgPost);
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
