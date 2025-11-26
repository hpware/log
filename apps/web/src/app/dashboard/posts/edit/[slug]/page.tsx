import { main_schema, db, dorm } from "../../../../../../../../packages/db/src";
import Client from "./client";

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const pullPost = await db
    .select()
    .from(main_schema.userPosts)
    .where(dorm.eq(main_schema.userPosts.postId, slug));
  if (pullPost.length === 0)
    return (
      <div>
        <span>Post not found</span>
      </div>
    );
  return <Client orgPost={pullPost[0]} />;
}
