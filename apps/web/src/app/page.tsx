import { PublicPostsAndVideos } from "@/components/publicPostsAndVideos";
import type { Metadata } from "next";
import { db, main_schema, dorm } from "../../../../packages/db/src";

export async function generateMetadata(): Promise<Metadata> {
  const titleResult = await db
    .select()
    .from(main_schema.kvData)
    .where(dorm.eq(main_schema.kvData.key, "title"));

  const descResult = await db
    .select()
    .from(main_schema.kvData)
    .where(dorm.eq(main_schema.kvData.key, "description"));

  const title = titleResult[0]?.value ?? "Default Title";
  const description = `${descResult[0]?.value ?? "Default Description"}`;

  return {
    title: `Home — ${title}`,
    description,
  };
}

export default function Home() {
  return (
    <section className="scroll-smooth">
      <PublicPostsAndVideos />
    </section>
  );
}
