// this is a really basic parser.
// Written by Claude Sonnet 4
export default function robotsTxtParseToJson(list: string) {
  const listBasicParse = list.replaceAll(" ", "").split("\n");

  const getFirstLastRuleOfTheRobotsTxt = listBasicParse.filter(
    (i) => i.includes("Disallow:") || i.includes("Allow:"),
  );

  let newList: {
    [userAgent: string]: { allow: string[]; disallow: string[] };
  } = {};
  let currentUserAgent = "*"; // Default user agent

  listBasicParse.map((line) => {
    const trimmedLine = line.trim();

    if (trimmedLine.toLowerCase().startsWith("user-agent:")) {
      // Extract user agent value
      currentUserAgent =
        trimmedLine.substring("user-agent:".length).trim() || "*";

      // Initialize user agent object if it doesn't exist
      if (!newList[currentUserAgent]) {
        newList[currentUserAgent] = {
          allow: [],
          disallow: [],
        };
      }
    } else if (trimmedLine.toLowerCase().startsWith("disallow:")) {
      // Extract disallow path
      const path = trimmedLine.substring("disallow:".length).trim();

      // Initialize user agent object if it doesn't exist
      if (!newList[currentUserAgent]) {
        newList[currentUserAgent] = {
          allow: [],
          disallow: [],
        };
      }

      if (path) {
        newList[currentUserAgent].disallow.push(path);
      }
    } else if (trimmedLine.toLowerCase().startsWith("allow:")) {
      // Extract allow path
      const path = trimmedLine.substring("allow:".length).trim();

      // Initialize user agent object if it doesn't exist
      if (!newList[currentUserAgent]) {
        newList[currentUserAgent] = {
          allow: [],
          disallow: [],
        };
      }

      if (path) {
        newList[currentUserAgent].allow.push(path);
      }
    }
  });

  return newList;
}
