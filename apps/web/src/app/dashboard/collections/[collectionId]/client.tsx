"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Plus, ArrowLeft, ImageIcon, TextInitialIcon, VideoIcon } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";

interface Collection {
  id: number;
  collectionId: string;
  title: string;
  slug: string;
  items: { postIds: string[] };
  byUser: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Post {
  postId: string;
  type: "text" | "photos" | "video";
  textData?: string;
  imageUrl?: string;
  videoUrl?: string;
  status: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  byUser: string;
}

export default function CollectionDetailClient({
  collectionId,
  session,
}: {
  collectionId: string;
  session: { user: { id: string; name: string; image?: string } };
}) {
  const queryClient = useQueryClient();
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [postIdToAdd, setPostIdToAdd] = useState("");

  const { data: collection, isLoading: collectionLoading } = useQuery<Collection>({
    queryKey: ["collection", collectionId],
    queryFn: async () => {
      const req = await fetch(`/api/data/collections/${collectionId}`, {
        method: "GET",
      });
      const res = await req.json();
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
  });

  const { data: allPosts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["all-posts-for-collection"],
    queryFn: async () => {
      const req = await fetch("/api/data/all_posts?offset=0");
      const res = await req.json();
      return res.result || [];
    },
    enabled: isAddingPost,
  });

  const collectionPostIds = collection?.items?.postIds || [];

  const collectionPosts = useMemo(() => {
    if (!allPosts) return [];
    return allPosts.filter((post) => collectionPostIds.includes(post.postId));
  }, [allPosts, collectionPostIds]);

  const availablePosts = useMemo(() => {
    if (!allPosts) return [];
    return allPosts.filter((post) => !collectionPostIds.includes(post.postId));
  }, [allPosts, collectionPostIds]);

  const addPostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const req = await fetch(`/api/data/collections/${collectionId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, action: "add" }),
      });
      const res = await req.json();
      if (!res.success) {
        throw new Error(res.message);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection", collectionId] });
      setIsAddingPost(false);
      setPostIdToAdd("");
      toast.success("Post added to collection");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const removePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const req = await fetch(`/api/data/collections/${collectionId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, action: "remove" }),
      });
      const res = await req.json();
      if (!res.success) {
        throw new Error(res.message);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection", collectionId] });
      toast.success("Post removed from collection");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (collectionLoading) {
    return (
      <div className="p-4">
        <div className="text-lg">Loading collection...</div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="p-4">
        <div className="text-lg">Collection not found</div>
        <Link href="/dashboard/collections" as={Route}>
          <Button className="mt-4">Back to Collections</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Link href="/dashboard/collections" as={Route}>
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Collections
        </Button>
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{collection.title}</h1>
          <p className="text-muted-foreground">/{collection.slug}</p>
        </div>
        <Button variant="outline" onClick={() => setIsAddingPost(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Post
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Collection Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Created: {new Date(collection.createdAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-muted-foreground">
              Updated: {new Date(collection.updatedAt).toLocaleDateString()}
            </p>
            <p className="text-sm mt-2">
              {collectionPostIds.length} posts in collection
            </p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mb-4">Posts in Collection</h2>
      
      {collectionPosts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">No posts in this collection yet</p>
            <Button variant="outline" className="mt-4" onClick={() => setIsAddingPost(true)}>
              Add your first post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {collectionPosts.map((post: Post) => (
            <Card key={post.postId}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {post.type === "text" ? (
                      <TextInitialIcon className="h-5 w-5" />
                    ) : post.type === "photos" ? (
                      <ImageIcon className="h-5 w-5" />
                    ) : (
                      <VideoIcon className="h-5 w-5" />
                    )}
                    <div>
                      <p className="font-medium line-clamp-2">
                        {post.textData || "No text"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {post.type} • {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Post</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove this post from the collection?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removePostMutation.mutate(post.postId)}
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isAddingPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add Post to Collection</CardTitle>
              <CardDescription>
                Select a post to add to this collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <p>Loading posts...</p>
              ) : availablePosts.length === 0 ? (
                <p className="text-muted-foreground">No posts available to add</p>
              ) : (
                <div className="space-y-2">
                  {availablePosts.map((post: Post) => (
                    <div
                      key={post.postId}
                      className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => addPostMutation.mutate(post.postId)}
                    >
                      <div className="flex items-center gap-2">
                        {post.type === "text" ? (
                          <TextInitialIcon className="h-4 w-4" />
                        ) : post.type === "photos" ? (
                          <ImageIcon className="h-4 w-4" />
                        ) : (
                          <VideoIcon className="h-4 w-4" />
                        )}
                        <span className="text-sm truncate">{post.textData || "No text"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" onClick={() => setIsAddingPost(false)}>
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}