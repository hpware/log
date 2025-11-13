import { NextResponse, type NextRequest } from "next/server";
import { dorm, db, main_schema } from "../../../../../../../packages/db/src";

export const GET = async (request: NextRequest) => {
  const startPerf = performance.now();
  try {
    // Check if search is enabled
    const searchStatus = await db
      .select()
      .from(main_schema.kvData)
      .where(dorm.eq(main_schema.kvData.key, "searchStatus"));

    if (searchStatus.length > 0 && searchStatus[0].value === false) {
      return NextResponse.json({
        success: false,
        msg: "Search functionality is currently disabled.",
        data: [],
        queryTime: 0,
        disabled: true,
      });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    if (query == null) {
      return NextResponse.json({
        success: false,
        msg: "No query.",
        data: [],
        queryTime: 0,
        disabled: false,
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
      disabled: false,
    });
  } catch (e: any) {
    console.error(e);
    const endPerf = performance.now();
    return NextResponse.json({
      success: false,
      msg: e.message,
      data: [],
      queryTime: endPerf - startPerf,
      disabled: false,
    });
  }
};
