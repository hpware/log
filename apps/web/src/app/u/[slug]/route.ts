import type { NextRequest } from "next/server";
import {
  db,
  dorm,
  main_schema,
  auth_schema,
} from "../../../../../../packages/db/src/index";

export const GET = async (request: NextRequest) => {
    return new Response("Sorry, this feature is still WIP!")
}