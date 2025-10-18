import { PublicPostsAndVideos } from "@/components/publicPostsAndVideos";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Home`,
};

export default async function Home() {
  return (
    <section className="scroll-smooth">
      <PublicPostsAndVideos />
    </section>
  );
}
