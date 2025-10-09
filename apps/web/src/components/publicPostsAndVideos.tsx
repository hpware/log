"use client";

import { useQuery } from "@tanstack/react-query";
import generateItemId from "@/components/generateItemId";
import { useState } from "react";
import { Button } from "./ui/button";

export function PublicPostsAndVideos() {
  const [itemId, setItemId] = useState("");
  const { isPending, error, data } = useQuery({
    queryKey: ["postContents"],
    queryFn: () =>
      fetch("/api/data/public_data?offset=0").then((res) => res.json()),
  });

  return (
    <div>
      {!error
        ? isPending
          ? "Loading..."
          : JSON.stringify(data)
        : `An error has occurred: ${error.message}`}

      <div className="flex flex-col">
        <Button onClick={() => setItemId(generateItemId())}>
          Generate New Item Id
        </Button>
        <span>{itemId}</span>
      </div>
    </div>
  );
}
