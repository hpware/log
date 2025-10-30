// this is a really basic parser.
// Written by Claude Sonnet 4
export default function robotsTxtParseToJson(list: string) {
  const lines = list
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#")); // remove comments & empty lines

  let newList: Record<string, { allow: string[]; disallow: string[] }> = {};
  let currentAgents: string[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase();

    if (lower.startsWith("user-agent:")) {
      const agent = line.substring("user-agent:".length).trim();
      if (agent) {
        currentAgents.push(agent);
        if (!newList[agent]) {
          newList[agent] = { allow: [], disallow: [] };
        }
      }
    } else if (lower.startsWith("disallow:")) {
      const path = line.substring("disallow:".length).trim();
      for (const agent of currentAgents) {
        if (!newList[agent]) newList[agent] = { allow: [], disallow: [] };
        newList[agent].disallow.push(path);
      }
    } else if (lower.startsWith("allow:")) {
      const path = line.substring("allow:".length).trim();
      for (const agent of currentAgents) {
        if (!newList[agent]) newList[agent] = { allow: [], disallow: [] };
        newList[agent].allow.push(path);
      }
    } else if (line === "") {
      // Reset currentAgents after a block ends
      currentAgents = [];
    }
  }

  return newList;
}
