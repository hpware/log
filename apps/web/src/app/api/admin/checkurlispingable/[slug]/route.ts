import type { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  context: {
    params: Promise<{ slug: string }>;
  },
) => {
  const { slug } = await context.params;
  return Response.json({
    success: true,
    msg: "",
  });
};
