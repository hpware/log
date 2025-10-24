import { PublicPostsAndVideos } from "@/components/publicPostsAndVideos";
import type { Metadata } from "next";
import { db, main_schema, dorm } from "../../../../packages/db/src/index";

export const dynamic = "force-dynamic";

export default async function Home() {
  return (
    <section className="scroll-smooth">
      <PublicPostsAndVideos mode="index" passedData={[]} />
    </section>
  );
}

export async function generateMetadata() {
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
}
