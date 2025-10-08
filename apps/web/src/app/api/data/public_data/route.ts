import type { NextRequest } from "next/server";
import { db } from "@/../../packages/db/src/index";

export const GET = async (request: NextRequest) => {
  const dbResult = db.query.userPosts;
};
