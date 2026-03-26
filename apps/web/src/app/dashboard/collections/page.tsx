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
import { Trash2, Edit, Plus, FolderOpen } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";

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

export default function CollectionsPage() {
  const queryClient = useQueryClient();
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");

  const { data: collections, isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const req = await fetch("/api/data/collections", {
        method: "GET",
      });
      const res = await req.json();
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data || [];
    },
  });

  const deleteCollection = useMutation({
    mutationFn: async (collectionId: string) => {
      const req = await fetch(`/api/data/collections/${collectionId}`, {
        method: "DELETE",
      });
      const res = await req.json();
      if (!res.success) {
        throw new Error(res.message);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success("Collection deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateCollection = useMutation({
    mutationFn: async (data: { collectionId: string; title: string; slug: string }) => {
      const req = await fetch(`/api/data/collections/${data.collectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: data.title, slug: data.slug }),
      });
      const res = await req.json();
      if (!res.success) {
        throw new Error(res.message);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setEditingCollection(null);
      toast.success("Collection updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const startEditing = (collection: Collection) => {
    setEditingCollection(collection);
    setEditTitle(collection.title);
    setEditSlug(collection.slug);
  };

  const cancelEditing = () => {
    setEditingCollection(null);
    setEditTitle("");
    setEditSlug("");
  };

  const saveEdit = () => {
    if (!editingCollection) return;
    if (!editTitle.trim() || !editSlug.trim()) {
      toast.error("Title and slug are required");
      return;
    }
    updateCollection.mutate({
      collectionId: editingCollection.collectionId,
      title: editTitle,
      slug: editSlug,
    });
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="text-lg">Loading collections...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Collections</h1>
        <Link href="/dashboard/collections/create" as={Route}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Collection
          </Button>
        </Link>
      </div>

      {collections?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No collections yet</p>
            <Link href="/dashboard/collections/create" as={Route} className="mt-4">
              <Button variant="outline">Create your first collection</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections?.map((collection: Collection) => (
            <Card key={collection.collectionId}>
              <CardHeader>
                <CardTitle>{collection.title}</CardTitle>
                <CardDescription>/{collection.slug}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {collection.items?.postIds?.length || 0} posts in collection
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Created: {new Date(collection.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Link
                  href={`/dashboard/collections/${collection.collectionId}` as Route}
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full">
                    View
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => startEditing(collection)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Collection</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{collection.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteCollection.mutate(collection.collectionId)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {editingCollection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Collection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Collection title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-slug">Slug</Label>
                <Input
                  id="edit-slug"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  placeholder="collection-slug"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelEditing}>
                Cancel
              </Button>
              <Button onClick={saveEdit}>Save</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}