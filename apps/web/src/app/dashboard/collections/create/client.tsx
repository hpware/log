"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CreateCollectionClient() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  const createCollection = useMutation({
    mutationFn: async () => {
      const req = await fetch("/api/data/create_collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug }),
      });
      const res = await req.json();
      if (!req.ok) {
        throw new Error(res.message || "Failed to create collection");
      }
      return res;
    },
    onSuccess: () => {
      toast.success("Collection created!");
      router.push("/dashboard/collections");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setSlug(
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    );
  };

  return (
    <div className="flex flex-col gap-4 max-w-lg">
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="font-medium">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="My Collection"
          className="border rounded px-3 py-2"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="slug" className="font-medium">
          Slug
        </label>
        <input
          id="slug"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="my-collection"
          className="border rounded px-3 py-2"
        />
        <p className="text-sm text-gray-500">
          URL-friendly identifier. Lowercase letters, numbers, and hyphens only.
        </p>
      </div>
      <Button
        onClick={() => createCollection.mutate()}
        disabled={!title || !slug || createCollection.isPending}
      >
        {createCollection.isPending ? "Creating..." : "Create Collection"}
      </Button>
    </div>
  );
}
