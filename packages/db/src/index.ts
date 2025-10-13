import { drizzle } from "drizzle-orm/node-postgres";
import * as main_schema from "./schema/main";
import * as schema2 from "./schema/auth";

export const db = drizzle(process.env.DATABASE_URL || "", {
  schema: { ...main_schema, ...schema2 },
});

export async function up() {
  try {
    await db
      .insert(main_schema.kvData)
      .values([
        { key: "title", value: "" },
        {
          key: "description",
          value: "Welcome to your instence of hpware/log!",
        },
        { key: "owner", value: "Server owner" },
      ])
      .onConflictDoNothing();
  } catch (e) {
    console.error(e);
  }
}

export * as dorm from "drizzle-orm";
export * as main_schema from "./schema/main";
export * as auth_schema from "./schema/auth";
