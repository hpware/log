import type { NextRequest } from "next/server";
import {
  db,
  dorm,
  main_schema,
  auth_schema,
} from "../../../../../../../packages/db/src/index";

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const offset = searchParams.get("offset");
    const pullFromUserId = searchParams.get("user");
    const filterParam = searchParams.get("filters");
    
    let filters: { by: string; filter: string }[] = [];
    if (filterParam) {
      try {
        filters = JSON.parse(decodeURIComponent(filterParam));
      } catch (e) {
        console.error("Failed to parse filters:", e);
      }
    }
    
    if (offset === null) {
      throw new Error("ERR_NO_PARAMS_TO_USE");
    }

    if (!/^\d+$/.test(offset)) {
    }
    if (!Number.isSafeInteger(Number(offset))) {
      throw new Error("ERR_OFFSET_PARAM_NOT_A_SAFE_INTEGER");
    }

    let query;
    if (pullFromUserId === null) {
      query = dorm.eq(main_schema.userPosts.status, "public");
      const homePageStatus = await db
        .select()
        .from(main_schema.kvData)
        .where(dorm.eq(main_schema.kvData.key, "homePageStatus"));

      if (String(homePageStatus[0].value) === "false") {
        return Response.json({
          success: true,
          msg: "",
          result: [],
          nextOffset: undefined,
          featDisabled: true,
        });
      }
    } else {
      query = dorm.and(
        dorm.eq(main_schema.userPosts.status, "public"),
        dorm.eq(main_schema.userPosts.byUser, pullFromUserId),
      );
    }

    if (filters.length > 0) {
      const tagFilters = filters.filter(f => f.by === "tag");
      const textFilters = filters.filter(f => f.by === "text");
      
      if (tagFilters.length > 0 || textFilters.length > 0) {
        const tagValues = tagFilters.map(f => f.filter);
        const textValues = textFilters.map(f => f.filter);
        
        let conditions: string[] = [];
        const params: any[] = [];
        
        if (tagValues.length > 0) {
          const placeholders = tagValues.map((_, i) => `$${i + 1}`).join(", ");
          conditions.push(`tags && ARRAY[${placeholders}]::text[]`);
          params.push(...tagValues);
        }
        
        if (textValues.length > 0) {
          const textSearchTerm = textValues.join(" ");
          const paramIndex = params.length + 1;
          conditions.push(`to_tsvector('english', text_data) @@ plainto_tsquery('english', $${paramIndex})`);
          params.push(textSearchTerm);
        }
        
        const conditionStr = conditions.join(" AND ");
        const rawSql = `SELECT * FROM user_posts WHERE status = 'public' ${pullFromUserId ? `AND by_user = '${pullFromUserId}'` : ''} AND ${conditionStr} ORDER BY created_at DESC LIMIT 50 OFFSET ${Number(offset)}`;
        
        const dbResult = await db.execute(dorm.sql(rawSql), params);
        
        const transformedRows = dbResult.rows.map((row: any) => ({
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
        }));

        return Response.json({
          success: true,
          msg: "",
          result: transformedRows,
          nextOffset: transformedRows.length < 50 ? undefined : Number(offset) + 50,
          featDisabled: false,
        });
      }
    }

    const dbResult = await db
      .select()
      .from(main_schema.userPosts)
      .where(query)
      .orderBy(dorm.desc(main_schema.userPosts.createdAt))
      .limit(50)
      .offset(Number(offset));
    return Response.json({
      success: true,
      msg: "",
      result: dbResult,
      nextOffset: dbResult.length < 50 ? undefined : Number(offset) + 50,
      featDisabled: false,
    });
  } catch (e: any) {
    console.error(e);
    return Response.json(
      { success: false, msg: e.message, result: [] },
      {
        status: 500,
      },
    );
  }
};
