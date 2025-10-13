import { PublicPostsAndVideos } from "@/components/publicPostsAndVideos";
import type { Metadata } from "next";
import { db, main_schema, dorm } from "../../../../packages/db/src";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const titleResult = await db
      .select()
      .from(main_schema.kvData)
      .where(dorm.eq(main_schema.kvData.key, "title"));

    const descResult = await db
      .select()
      .from(main_schema.kvData)
      .where(dorm.eq(main_schema.kvData.key, "description"));

    const title = titleResult[0]?.value ?? "";
    const description = `${descResult[0]?.value ?? ""}`;

    return {
      title: `Home ${title}`,
      description,
    };
  } catch (e) {
    console.error(e);
    return {
      title: `Home`,
    };
  }
}

export default async function Home() {
  return (
    <section className="scroll-smooth">
      <PublicPostsAndVideos />
    </section>
  );
}
