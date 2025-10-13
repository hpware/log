import type { NextRequest } from "next/server";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export const GET = async (request: NextRequest, context: Props) => {
  const { slug } = await context.params;
};
