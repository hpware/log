import { NextResponse, type NextRequest } from "next/server";
import { dorm, db } from "../../../../../../../packages/db/src";

export const GET = async (request: NextRequest) => {
  const startPerf = performance.now();
  const searchData = await db.execute(
    dorm.sql`select to_tsvector('english', 'y')`,
  );
  const endPerf = performance.now();
  return NextResponse.json({
    success: true,
    data: searchData,
    queryTime: endPerf - startPerf,
  });
};
