"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function CollectionEditor({
  collection,
  posts,
}: {
  collection: {
    collectionId: string;
    title: string;
    slug: string;
    items: string[];
  };
  posts: {
    postId: string;
    text: string | null;
    type: string;
    status: string;
  }[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(collection);
  const [filter, setFilter] = useState("");
  const [pending, setPending] = useState(false);
  return (
    <form
      className="max-w-2xl space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        try {
          const response = await fetch("/api/data/collections", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(draft),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.message);
          toast.success("Collection saved");
          router.push("/dashboard/collections");
          router.refresh();
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Could not save collection",
          );
        } finally {
          setPending(false);
        }
      }}
    >
      <h1 className="text-xl">Edit collection</h1>
      <label className="block">
        Title
        <Input
          value={draft.title}
          onChange={(event) =>
            setDraft({ ...draft, title: event.target.value })
          }
          required
          maxLength={200}
        />
      </label>
      <label className="block">
        URL slug
        <Input
          value={draft.slug}
          onChange={(event) => setDraft({ ...draft, slug: event.target.value })}
          required
          maxLength={100}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
        />
      </label>
      <fieldset className="space-y-2">
        <legend>Posts ({draft.items.length} selected)</legend>
        <p className="text-sm text-muted-foreground">
          Visitors see public posts only. Removing an item keeps the original
          post.
        </p>
        <Input
          aria-label="Find your posts"
          placeholder="Find your posts"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
        <div className="max-h-96 overflow-auto space-y-2">
          {posts
            .filter((post) =>
              `${post.text || ""} ${post.type}`
                .toLowerCase()
                .includes(filter.toLowerCase()),
            )
            .map((post) => (
              <label
                key={post.postId}
                className="flex items-start gap-2 border rounded p-2"
              >
                <input
                  type="checkbox"
                  checked={draft.items.includes(post.postId)}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      items: event.target.checked
                        ? [...prev.items, post.postId]
                        : prev.items.filter((id) => id !== post.postId),
                    }))
                  }
                />
                <span>
                  <span className="block line-clamp-2">
                    {post.text || `${post.type} post`}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {post.status}
                  </span>
                </span>
              </label>
            ))}
          {!posts.length && <p>Create a post to add it to this collection.</p>}
        </div>
      </fieldset>
      <Button disabled={pending} type="submit">
        {pending ? "Saving..." : "Save collection"}
      </Button>
    </form>
  );
}
