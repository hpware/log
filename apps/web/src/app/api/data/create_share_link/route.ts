import type { NextRequest } from "next/server";
import {
  dorm,
  main_schema,
  auth_schema,
  db,
} from "../../../../../../../packages/db/src/index";

export const POST = (request: NextRequest) => {
  const body = request.json();
  return new Response("ok", {
    status: 403,
  });
};
