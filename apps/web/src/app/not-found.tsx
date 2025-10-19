"use client";
import { useRouter } from "next/navigation";
export default function ErrorPage() {
  const router = useRouter();
  return (
    <div className="absolute inset-0 justify-center text-center align-middle flex flex-col">
      <span className="text-4xl md:text-8xl text-bold archivo-black select-none">
        404
      </span>
      <span>Whoops! This page cannot be found!</span>
      <span>You can maybe find it via searching it tho!</span>
      <textarea
        className="border rounded-xl w-[70%] max-w-[400px] justify-center mx-auto mt-2 px-2 py-1 resize-none overflow-y-hidden overflow-scroll overflow-x-hidden whitespace-nowrap"
        rows={1}
        onClick={() => router.push("/search?focus=1")}
        placeholder="Type anything..."
      ></textarea>
    </div>
  );
}
