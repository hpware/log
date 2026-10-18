/** Parse trusted HTTP origins from comma-separated values or quoted array notation. */
export function parseTrustedOrigins(value: string | undefined): string[] {
  let input = value?.trim() || "";
  if (!input) return [];
  if (input.startsWith("[") || input.endsWith("]")) {
    if (!input.startsWith("[") || !input.endsWith("]")) {
      throw new Error(
        "CORS_ORIGINS/CORS_ORIGIN must contain a complete origin list",
      );
    }
    input = input.slice(1, -1).trim();
  }
  if (!input) return [];

  const origins = input
    .split(",")
    .filter((entry) => entry.trim())
    .map((entry) => {
      let origin = entry.trim();
      if (origin.startsWith('"') || origin.startsWith("'")) {
        const quote = origin[0];
        if (origin.length < 2 || !origin.endsWith(quote!)) {
          throw new Error(
            "CORS_ORIGINS/CORS_ORIGIN contains an unclosed quote",
          );
        }
        origin = origin.slice(1, -1);
      }
      try {
        const url = new URL(origin);
        if (
          !["http:", "https:"].includes(url.protocol) ||
          url.username ||
          url.password ||
          url.search ||
          url.hash ||
          url.pathname !== "/"
        ) {
          throw new Error("Invalid origin");
        }
        return url.origin;
      } catch {
        throw new Error(
          "CORS_ORIGINS/CORS_ORIGIN entries must be HTTP(S) origins without paths or credentials",
        );
      }
    });
  return [...new Set(origins)];
}
