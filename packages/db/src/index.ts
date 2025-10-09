import { drizzle } from "drizzle-orm/node-postgres";
import * as main_schema from "./schema/main";
import * as schema2 from "./schema/auth";

export const db = drizzle(process.env.DATABASE_URL || "", {
  schema: { ...main_schema, ...schema2 },
});

export * as dorm from "drizzle-orm";
export * as main_schema from "./schema/main";
export * as auth_schema from "./schema/auth";
