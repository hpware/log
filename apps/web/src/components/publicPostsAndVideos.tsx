import { useQuery } from "@tanstack/react-query";

export function PublicPostsAndVideos() {
  const { isPending, error, data } = useQuery({
    queryKey: ["postContents"],
    queryFn: () =>
      fetch("https://api.github.com/repos/vercel/commerce").then((res) =>
        res.json(),
      ),
  });

  if (isPending) return "Loading...";

  if (error) return "An error has occurred: " + error.message;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
      <strong>👀 {data.subscribers_count}</strong>{" "}
      <strong>✨ {data.stargazers_count}</strong>{" "}
      <strong>🍴 {data.forks_count}</strong>
    </div>
  );
}
