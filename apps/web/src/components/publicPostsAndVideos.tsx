"use client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { useState } from "react";
import Spinner from "@/components/spinner";
import { main_schema } from "../../../../packages/db/src/index";

export function PublicPostsAndVideos() {
  const [currentOffset, setCurrentOffset] = useState(0);
  const [reloadPost, setReloadPost] = useState(false);
  const [logData, setLogData] = useState<(typeof main_schema.userPosts)[]>([]);
  const { isPending, error, data } = useQuery({
    queryKey: ["postContents", reloadPost],
    queryFn: () =>
      fetch(`/api/data/public_data?offset=${currentOffset}`).then((res) =>
        res.json(),
      ),
  });
  if (!isPending && !error && data.sucess) {
    if (logData.length !== 0) {
      setLogData([...logData, data.result]);
    } else {
      setLogData(data.result);
    }
  }

  return (
    <div>
      {logData.length !== 0 ? (
        <div>{JSON.stringify(logData)}</div>
      ) : (
        !isPending && (
          <div>
            <span>This is empty :(</span>
            <Button
              variant="outline"
              onClick={() => {
                setReloadPost((prev) => !prev);
              }}
            >
              Try again
            </Button>
          </div>
        )
      )}
      {error ? (
        <div>
          <span>Error fetching new posts: {error.message}</span>
          <Button
            variant="outline"
            onClick={() => {
              setReloadPost((prev) => !prev);
            }}
          >
            Try again
          </Button>
        </div>
      ) : (
        data &&
        !data.success && (
          <div>
            <span>Error fetching new posts: {data.msg}</span>
            <Button
              variant="outline"
              onClick={() => {
                setReloadPost((prev) => !prev);
              }}
            >
              Try again
            </Button>
          </div>
        )
      )}
      {isPending && (
        <div className="justify-center align-center text-center align-middle flex self-center">
          <Spinner className="justify-center align-center text-center align-middle flex self-center" />
        </div>
      )}
    </div>
  );
}
