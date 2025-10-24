import { NextResponse, type NextRequest } from "next/server";
import { dorm, db } from "../../../../../../../packages/db/src";

export const GET = async (request: NextRequest) => {
  const startPerf = performance.now();
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    if (query == null) {
      return NextResponse.json({
        success: false,
        msg: "No query.",
        data: [],
        queryTime: 0,
      });
    }
    const searchData = await db.execute(
      dorm.sql`
        SELECT *,
               ts_rank(to_tsvector('english', text_data),
                       plainto_tsquery('english', ${query})) AS rank
                       FROM user_posts
                       WHERE to_tsvector('english', text_data)
                             @@ plainto_tsquery('english', ${query})
                       ORDER BY rank DESC;
    `,
    );
    const endPerf = performance.now();
    return NextResponse.json({
      success: true,
      msg: "",
      data: searchData,
      queryTime: endPerf - startPerf,
    });
  } catch (e: any) {
    console.error(e);
    const endPerf = performance.now();
    return NextResponse.json({
      success: false,
      msg: e.message,
      data: [],
      queryTime: endPerf - startPerf,
    });
  }
};
