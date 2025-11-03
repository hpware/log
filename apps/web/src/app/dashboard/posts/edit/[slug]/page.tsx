import { PublicPostsAndVideos } from "@/components/publicPostsAndVideos";
import { main_schema, db, dorm } from "../../../../../../../../packages/db/src";

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const pullPost = await db
    .select()
    .from(main_schema.userPosts)
    .where(dorm.eq(main_schema.userPosts.postId, slug));
  const post = pullPost[0];
  return (
    <div>
      <span>{JSON.stringify(post)}</span>
      <PublicPostsAndVideos
        mode="search"
        passedData={[post]}
        noDisplay={["profileLink", "link"]}
      />
    </div>
  );
}
