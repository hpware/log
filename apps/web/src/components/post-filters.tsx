"use client";
import { useSearchParams } from "next/navigation";
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
