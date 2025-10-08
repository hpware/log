import { drizzle } from "drizzle-orm/node-postgres";
import * as schema1 from "./schema/main";
import * as schema2 from "./schema/auth";

export const db = drizzle(process.env.DATABASE_URL || "", {
  schema: [...schema1, ...schema2],
});
