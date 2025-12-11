import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { db, dorm, main_schema } from "@devlogs_hosting/db";
import * as schema from "@devlogs_hosting/db/schema/auth";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",

    schema: schema,
  }),
  trustedOrigins: JSON.parse(JSON.stringify(process.env.CORS_ORIGINS || [])),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin()],
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
    disableCSRFCheck: process.env.NODE_ENV === "development" ? true : false,
    trustedProxyHeaders: true,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          try {
            const checkIfSystemDisabledRegister = await db
              .select()
              .from(main_schema.kvData)
              .where(dorm.eq(main_schema.kvData.key, "registrationStatus"))
              .limit(1);
            if (checkIfSystemDisabledRegister[0]?.value === false) {
              throw new Error("Registration is disabled");
            }
            // Query database directly using your existing Drizzle connection
            const existingUsers = await db
              .select()
              .from(schema.user)
              .limit(1)
              .execute();

            // If no users exist, make this user an admin
            if (existingUsers.length === 0) {
              return {
                data: {
                  ...user,
                  role: "admin",
                },
              };
            }
            return {
              data: {
                ...user,
                role: "user",
              },
            };
          } catch (error) {
            // Fallback on error
            return {
              data: {
                ...user,
                role: "user",
              },
            };
          }
        },
      },
    },
  },
});
