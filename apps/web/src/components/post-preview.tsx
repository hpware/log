"use client";
import { useEffect, useRef, useState } from "react";
import Markdown, { type ReactRenderer } from "marked-react";

export default function PostPreview({ text }: { text: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const content = useRef<HTMLDivElement>(null);
  const [clipped, setClipped] = useState(false);
  useEffect(() => {
    const element = content.current;
    if (!element) return;
    const measure = () =>
      setClipped(element.scrollHeight > element.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text, expanded]);
  if (!text) return null;
  return (
    <div className="break-words min-w-0 p-2">
      <div
        ref={content}
        className={
          expanded
            ? "space-y-2 [&_pre]:overflow-auto"
            : "max-h-40 overflow-hidden space-y-2 [&_pre]:overflow-auto"
        }
      >
        <Markdown
          openLinksInNewTab
          renderer={{
            image(this: ReactRenderer, _src, alt) {
              return <span key={this.elementId}>{alt || "[Image]"}</span>;
            },
            link(this: ReactRenderer, href, children) {
              let safe = false;
              try {
                safe = ["http:", "https:", "mailto:"].includes(
                  new URL(href, "https://local.invalid").protocol,
                );
              } catch {}
              return safe ? (
                <a
                  key={this.elementId}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {children}
                </a>
              ) : (
                <span key={this.elementId}>{children}</span>
              );
            },
          }}
        >
          {text}
        </Markdown>
      </div>
      {(clipped || expanded) && (
        <button
          type="button"
          className="text-sm underline mt-2"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
