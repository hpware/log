import { expect, test } from "bun:test";
import { parseTrustedOrigins } from "../packages/auth/src/trusted-origins";

const origins = [
  "https://pub.log.yachts",
  "https://logs.2oo.dev",
  "https://logs.pleaseuse.me",
  "https://2b6c95.a.srv.yhw.tw",
];

test("accepts the supplied single-quoted origin array", () => {
  expect(
    parseTrustedOrigins(
      "['https://pub.log.yachts', 'https://logs.2oo.dev', 'https://logs.pleaseuse.me', 'https://2b6c95.a.srv.yhw.tw']",
    ),
  ).toEqual(origins);
});
test("accepts JSON arrays, comma-separated origins, and one origin", () => {
  expect(parseTrustedOrigins(JSON.stringify(origins))).toEqual(origins);
  expect(parseTrustedOrigins(origins.join(", "))).toEqual(origins);
  expect(parseTrustedOrigins(origins[0])).toEqual([origins[0]]);
});
test("normalizes trailing slashes and duplicates and supports local ports", () => {
  expect(
    parseTrustedOrigins(
      "https://pub.log.yachts/,https://pub.log.yachts,http://localhost:3001",
    ),
  ).toEqual(["https://pub.log.yachts", "http://localhost:3001"]);
});
test("empty configuration produces no additional trusted origins", () => {
  for (const value of [undefined, "", " ", "[]", "[ ]"])
    expect(parseTrustedOrigins(value)).toEqual([]);
});
test("rejects malformed lists and non-origin entries", () => {
  for (const value of [
    "['https://pub.log.yachts'",
    "['https://pub.log.yachts]",
    "[42]",
    "https://example.com/path",
    "https://user:password@example.com",
    "javascript:alert(1)",
    "https://example.com?query=1",
  ]) {
    expect(() => parseTrustedOrigins(value)).toThrow(
      "CORS_ORIGINS/CORS_ORIGIN",
    );
  }
});
