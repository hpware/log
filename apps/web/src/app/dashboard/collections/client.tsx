"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Collection = { collectionId: string; title: string; slug: string };
export default function Collections({ initial }: { initial: Collection[] }) {
  const [collections, setCollections] = useState(initial);
  const [pending, setPending] = useState(false);
  return (
    <div className="space-y-4">
      <h1 className="text-xl">Collections</h1>
      <Link href="/dashboard/collections/create" className="underline">
        Create a collection
      </Link>
      {!collections.length && (
        <p>
          No collections yet. Create one, then add posts from the post editor.
        </p>
      )}
      {collections.map((collection) => (
        <div
          key={collection.collectionId}
          className="flex items-center gap-4 border rounded p-3"
        >
          <Link href={`/c/${collection.slug}`} className="underline">
            {collection.title}
          </Link>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={async () => {
              if (
                !window.confirm(
                  "Delete this collection? Its posts will be kept.",
                )
              )
                return;
              setPending(true);
              try {
                const response = await fetch(
                  `/api/data/collections?id=${encodeURIComponent(collection.collectionId)}`,
                  { method: "DELETE" },
                );
                const result = await response.json();
                if (!response.ok) throw new Error(result.message);
                setCollections((prev) =>
                  prev.filter(
                    (item) => item.collectionId !== collection.collectionId,
                  ),
                );
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Could not delete collection",
                );
              } finally {
                setPending(false);
              }
            }}
          >
            Delete
          </Button>
        </div>
      ))}
    </div>
  );
}

export function CreateCollection() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <form
      className="flex flex-col gap-4 max-w-lg"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setPending(true);
        try {
          const response = await fetch("/api/data/collections", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: data.get("title"),
              slug: data.get("slug"),
            }),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.message);
          router.push("/dashboard/collections");
          router.refresh();
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Could not create collection",
          );
        } finally {
          setPending(false);
        }
      }}
    >
      <h1 className="text-xl">Create a collection</h1>
      <label>
        Title
        <input
          className="border rounded p-2 block w-full"
          name="title"
          required
          maxLength={200}
        />
      </label>
      <label>
        URL slug
        <input
          className="border rounded p-2 block w-full"
          name="slug"
          required
          maxLength={100}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
        />
      </label>
      <p>
        Use lowercase letters, numbers, and hyphens. Only public posts appear
        for visitors.
      </p>
      <Button disabled={pending} type="submit">
        {pending ? "Creating..." : "Create"}
      </Button>
    </form>
  );
}
