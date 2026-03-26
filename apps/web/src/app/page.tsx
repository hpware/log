"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PublicPostsAndVideos } from "@/components/publicPostsAndVideos";
import type { FilterFormat } from "@/components/publicPostsAndVideos";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { db, main_schema, dorm } from "../../../../packages/db/src/index";
import type { Metadata } from "next";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterFormat[]>([]);
  const [textFilter, setTextFilter] = useState("");

  useEffect(() => {
    const filterParam = searchParams.get("filters");
    if (filterParam) {
      try {
        setFilters(JSON.parse(decodeURIComponent(filterParam)));
      } catch (e) {
        console.error("Failed to parse filters:", e);
      }
    } else {
      setFilters([]);
    }
  }, [searchParams]);

  const updateFilters = (newFilters: FilterFormat[]) => {
    setFilters(newFilters);
    if (newFilters.length > 0) {
      router.push(`/?filters=${encodeURIComponent(JSON.stringify(newFilters))}`);
    } else {
      router.push("/");
    }
  };

  const clearFilters = () => {
    setFilters([]);
    setTextFilter("");
    router.push("/");
  };

  const addTextFilter = () => {
    if (textFilter.trim()) {
      const newFilters = [...filters.filter(f => f.by !== "text"), { by: "text" as const, filter: textFilter.trim() }];
      updateFilters(newFilters);
      setTextFilter("");
    }
  };

  return (
    <section className="scroll-smooth">
      <div className="p-4 flex flex-col gap-2">
        <div className="flex flex-row gap-2 items-center flex-wrap">
          <input
            type="text"
            placeholder="Filter by text..."
            value={textFilter}
            onChange={(e) => setTextFilter(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTextFilter();
              }
            }}
            className="border rounded px-2 py-1 max-w-[200px]"
          />
          <Button variant="outline" size="sm" onClick={addTextFilter}>Add Text Filter</Button>
          {filters.length > 0 && (
            <Button variant="destructive" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" /> Clear Filters
            </Button>
          )}
        </div>
        {filters.length > 0 && (
          <div className="flex flex-row gap-2 flex-wrap items-center">
            <span className="text-sm text-gray-500">Active filters:</span>
            {filters.map((f, idx) => (
              <div key={idx} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm flex items-center gap-1">
                {f.by}: {f.filter}
                <button onClick={() => {
                  const newFilters = filters.filter((_, i) => i !== idx);
                  updateFilters(newFilters);
                }} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <PublicPostsAndVideos mode="index" passedData={[]} filters={filters} />
    </section>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const kvTitle = await db
      .select()
      .from(main_schema.kvData)
      .where(dorm.eq(main_schema.kvData.key, "title"));
    const kvDescription = await db
      .select()
      .from(main_schema.kvData)
      .where(dorm.eq(main_schema.kvData.key, "description"));
    return {
      title: `Home ${kvTitle.length !== 0 ? `| ${kvTitle[0].value}` : ""}`,
      description: `${kvDescription.length !== 0 ? kvDescription[0].value : ""}`,
    };
  } catch {
    return { title: "Home" };
  }
}
