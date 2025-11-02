import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@devlogs_hosting/db";
import * as schema from "@devlogs_hosting/db/schema/auth";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",

    schema: schema,
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
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
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          // Check if context is available
          if (!ctx?.internalAdapter) {
            // Fallback: assign default role if no context
            return {
              data: {
                ...user,
                role: "user",
              },
            };
          }
          try {
            // Check if this is the first user using internalAdapter
            const existingUsers = await ctx.internalAdapter.findMany({
              model: "user",
              limit: 1,
            });
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
