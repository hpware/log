import { PublicPostsAndVideos } from "@/components/publicPostsAndVideos";
import { main_schema, db, dorm } from "../../../../../../../../packages/db/src";
import { Button } from "@/components/ui/button";

type Post = typeof main_schema.userPosts.$inferSelect;

export default function Client({ orgPost }: { orgPost: Post }) {
  const post = orgPost;
  return (
    <div className="flex flex-col md:flex-row">
      <div>
        <textarea />
        <Button variant="outline">Submit</Button>
      </div>
      <div>Change Visibly</div>
      <div>
        <span></span>
        <PublicPostsAndVideos mode="search" passedData={[post]} />
      </div>
    </div>
  );
}
