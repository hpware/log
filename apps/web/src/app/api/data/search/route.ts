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

    // Transform snake_case PostgreSQL results to camelCase to match Drizzle schema
    const transformedRows = searchData.rows.map((row: any) => ({
      postId: row.post_id,
      type: row.type,
      createdAt: row.created_at,
      byUser: row.by_user,
      textData: row.text_data,
      imageUrl: row.image_url,
      videoUrl: row.video_url,
      status: row.status,
      tags: row.tags,
      updatedAt: row.updated_at,
      rank: row.rank,
    }));

    const endPerf = performance.now();
    return NextResponse.json({
      success: true,
      msg: "",
      data: { ...searchData, rows: transformedRows },
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
