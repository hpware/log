import { useQuery } from "@tanstack/react-query";

export function PublicPostsAndVideos() {
  const { isPending, error, data } = useQuery({
    queryKey: ["postContents"],
    queryFn: () =>
      fetch("/api/data/public_data?offset=0").then((res) => res.json()),
  });

  if (isPending) return "Loading...";

  if (error) return "An error has occurred: " + error.message;

  return <div>{JSON.stringify(data)}</div>;
}
