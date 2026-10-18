import { expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PostPreview from "./post-preview";

test("feed previews render Markdown formatting and escape embedded HTML", () => {
  const html = renderToStaticMarkup(
    createElement(PostPreview, {
      text: "**bold** and `code`\n\n<script>alert(1)</script>",
    }),
  );
  expect(html).toContain("<strong>bold</strong>");
  expect(html).toContain("<code>code</code>");
  expect(html).not.toContain("<script>");
  expect(html).toContain("&lt;script&gt;");
});

test("Markdown image references stay as text in compact previews", () => {
  const html = renderToStaticMarkup(
    createElement(PostPreview, {
      text: "![caption](https://example.com/image.jpg)",
    }),
  );
  expect(html).toContain("caption");
  expect(html).not.toContain("<img");
});


test("Markdown preview links reject unsafe protocols", () => {
  const html = renderToStaticMarkup(createElement(PostPreview, { text: "[unsafe](javascript:alert%281%29) [safe](https://example.com)" }));
  expect(html).not.toContain("javascript:");
  expect(html).toContain('href="https://example.com"');
  expect(html).toContain('rel="noopener noreferrer"');
});
