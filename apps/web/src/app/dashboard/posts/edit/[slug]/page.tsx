import { main_schema, db, dorm } from "../../../../../../../../packages/db/src";

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const pullPost = await db
    .select()
    .from(main_schema.userPosts)
    .where(dorm.eq(main_schema.userPosts.postId, slug));
  return <div>{JSON.stringify(pullPost)}</div>;
}
