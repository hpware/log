import type { NextRequest } from "next/server";
import { db, dorm, main_schema } from "../../../../../packages/db/src";

type RobotsParsedJson = Record<string, { allow: string[]; disallow: string[] }>;

export const dynamic = "force-dynamic";

export const GET = async (request: NextRequest) => {
  const homePageStatus = await db
    .select()
    .from(main_schema.kvData)
    .where(dorm.eq(main_schema.kvData.key, "robotsTxtStatus"));

  if (String(homePageStatus[0].value) === "false") {
    return new Response(
      `# robots.txt disabled by owner, default block all robots. \n\nUser-agent: *\nDisallow: /*`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
        },
      },
    );
  }
  const robotsTxt = await db
    .select()
    .from(main_schema.kvData)
    .where(dorm.eq(main_schema.kvData.key, "robotsTxtList"));

  // Build robots.txt
  let buildRobotsTxt = "# robots.txt served by the server \n\n";
  // Assuming robotsTxt[0].value is the parsed JSON structure from the previous function
  const robotsData = robotsTxt[0].value as Record<
    string,
    { allow: string[]; disallow: string[] }
  >;
  Object.entries(robotsData).map(([userAgent, rules]) => {
    // Add User-agent line
    buildRobotsTxt += `User-agent: ${userAgent}\n`;
    // Add Disallow rules
    rules.disallow.forEach((path) => {
      buildRobotsTxt += `Disallow: ${path}\n`;
    });
    // Add Allow rules
    rules.allow.forEach((path) => {
      buildRobotsTxt += `Allow: ${path}\n`;
    });
    // Add empty line between user agents (except for the last one)
    buildRobotsTxt += "\n";
  });

  // Remove the trailing newline
  buildRobotsTxt = buildRobotsTxt.trim();

  return new Response(buildRobotsTxt, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
};
