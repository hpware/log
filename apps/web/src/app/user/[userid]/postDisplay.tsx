"use client";
import FilteredFeed from "@/components/filtered-feed";
export default function DisplayPosts({
  user,
}: {
  user: { id: string };
  isSameUser: boolean;
}) {
  return <FilteredFeed userId={user.id} />;
}
