"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { browseSchema, filtersSchema } from "@/lib/post-validation";

export function usePostFilters() {
  const params = useSearchParams();
  const parsed = browseSchema.safeParse(Object.fromEntries(params));
  const value = parsed.success ? parsed.data : browseSchema.parse({});
  if (!value.tag) {
    try {
      const legacy = filtersSchema.safeParse(
        JSON.parse(params.get("filters") || "[]"),
      );
      if (legacy.success && legacy.data.length === 1)
        value.tag = legacy.data[0].filter;
    } catch {}
  }
  return value;
}

export default function PostFilters() {
  const current = usePostFilters();
  const [draft, setDraft] = useState(current);
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  useEffect(
    () => setDraft(current),
    [current.query, current.tag, current.type],
  );
  function navigate(clear = false) {
    const next = new URLSearchParams(params);
    for (const key of ["query", "tag", "type", "filters"]) next.delete(key);
    if (!clear) {
      if (draft.query.trim()) next.set("query", draft.query.trim());
      if (draft.tag.trim()) next.set("tag", draft.tag.trim());
      if (draft.type !== "all") next.set("type", draft.type);
    }
    router.push(`${pathname}${next.size ? `?${next}` : ""}` as Route);
  }
  return (
    <form
      className="flex flex-wrap items-end gap-3 p-4"
      aria-label="Filter posts"
      onSubmit={(event) => {
        event.preventDefault();
        navigate();
      }}
    >
      <label className="flex-1 min-w-40">
        Text
        <Input
          type="search"
            autoFocus={params.get("focus") === "1"}
          maxLength={500}
          value={draft.query}
          onChange={(event) =>
            setDraft({ ...draft, query: event.target.value })
          }
          placeholder="Search posts"
        />
      </label>
      <label>
        Tag
        <Input
          maxLength={100}
          value={draft.tag}
          onChange={(event) => setDraft({ ...draft, tag: event.target.value })}
          placeholder="Exact tag"
        />
      </label>
      <label>
        Post type
        <select
          className="block border rounded h-9 px-2 bg-background"
          value={draft.type}
          onChange={(event) =>
            setDraft({
              ...draft,
              type: event.target.value as typeof draft.type,
            })
          }
        >
          <option value="all">All posts</option>
          <option value="text">Text</option>
          <option value="photos">Photos</option>
          <option value="video">Videos</option>
        </select>
      </label>
      <Button type="submit">Apply filters</Button>
      <Button type="button" variant="outline" onClick={() => navigate(true)}>
        Clear
      </Button>
    </form>
  );
}
