"use client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { useState } from "react";
import Spinner from "@/components/spinner";

export function PublicPostsAndVideos() {
  const [currentOffset, setCurrentOffset] = useState(0);
  const [logData, setLogData] = useState([]);
  const { isPending, error, data } = useQuery({
    queryKey: ["postContents"],
    queryFn: () =>
      fetch(`/api/data/public_data?offset=${currentOffset}`).then((res) =>
        res.json(),
      ),
  });
  if (!isPending && !error && data.sucess) {
    if (logData.length === 0) {
      setLogData(data.result);
    } //else {
    // setLogData([...logData, data.result]);
    //}
  }

  return (
    <div>
      {logData ? (
        <>
          <div>{JSON.stringify(logData)}</div>
        </>
      ) : (
        <span>An error has occurred: {data.msg}</span>
      )}
      {error ? (
        <div>
          <span>Error fetching new posts: {error.message}</span>
          <Button>Try again</Button>
        </div>
      ) : (
        data &&
        !data.success && (
          <div>
            <span>Error fetching new posts: {data.msg}</span>
            <Button>Try again</Button>
          </div>
        )
      )}
      {isPending && (
        <Spinner className="justify-center align-center text-center align-middle flex self-center" />
      )}
    </div>
  );
}
