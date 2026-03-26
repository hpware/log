import { NextResponse, type NextRequest } from "next/server";
import { dorm, db, main_schema } from "../../../../../../../packages/db/src";

export const GET = async (request: NextRequest) => {
  const startPerf = performance.now();
  try {
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
    const filterParam = searchParams.get("filters");
    
    let filters: { by: string; filter: string }[] = [];
    if (filterParam) {
      try {
        filters = JSON.parse(decodeURIComponent(filterParam));
      } catch (e) {
        console.error("Failed to parse filters:", e);
      }
    }

    if (query == null && filters.length === 0) {
      return NextResponse.json({
        success: false,
        msg: "No query.",
        data: [],
        queryTime: 0,
        disabled: false,
      });
    }
    
    let whereClause = "status IN ('public')";
    const params: any[] = [];
    
    if (query && query.trim()) {
      whereClause += ` AND to_tsvector('english', text_data) @@ plainto_tsquery('english', $1)`;
      params.push(query);
    }
    
    if (filters.length > 0) {
      const tagFilters = filters.filter(f => f.by === "tag");
      const textFilters = filters.filter(f => f.by === "text");
      
      if (tagFilters.length > 0) {
        const tagValues = tagFilters.map(f => f.filter);
        const placeholders = tagValues.map((_, i) => `$${params.length + i + 1}`).join(", ");
        whereClause += ` AND tags && ARRAY[${placeholders}]::text[]`;
        params.push(...tagValues);
      }
      
      if (textFilters.length > 0) {
        const textSearchTerm = textFilters.map(f => f.filter).join(" ");
        const paramIndex = params.length + 1;
        whereClause += ` AND to_tsvector('english', text_data) @@ plainto_tsquery('english', $${paramIndex})`;
        params.push(textSearchTerm);
      }
    }
    
    const orderBy = query || (filters.filter(f => f.by === "text").length > 0) ? "ORDER BY rank DESC" : "ORDER BY created_at DESC";
    const rankSelect = (query || (filters.filter(f => f.by === "text").length > 0)) ? "ts_rank(to_tsvector('english', text_data), plainto_tsquery('english', COALESCE($1, ''))) AS rank," : "";
    const searchData = params.length > 0 
      ? await db.execute(
          dorm.sql`SELECT *, ${dorm.sql(rankSelect)} FROM user_posts WHERE ${dorm.sql(whereClause)} ${dorm.sql(orderBy)}`,
          params,
        )
      : await db.execute(
          dorm.sql`SELECT * FROM user_posts WHERE ${dorm.sql(whereClause)} ${dorm.sql(orderBy)}`,
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
