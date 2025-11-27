import Link from "next/link";
import CodeRender from "./markdownCodeBlock";
import type { Route } from "next";

// Slugify function for heading IDs
function slugify(text: string) {
  return String(text)
    .toLowerCase()
    .replace(/[^\w]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
const renderer = {
  heading(text: string, level: number) {
    const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
    const id = slugify(text);
    const size =
      level === 1
        ? "text-2xl"
        : level === 2
          ? "text-xl"
          : level === 3
            ? "text-lg"
            : level === 4
              ? "text-md"
              : "text-base";
    return (
      <Tag
        id={id}
        key={crypto.randomUUID()}
        className={`${size} font-bold mt-2 mb-2`}
      >
        {text}
      </Tag>
    );
  },
  strong(text: string) {
    return (
      <b className="font-bold" key={crypto.randomUUID()}>
        {text}
      </b>
    );
  },
  image(src: string, alt: string) {
    return (
      <img
        src={src}
        alt={alt}
        key={crypto.randomUUID()}
        className="max-w-full h-auto rounded-lg p-1 m-1"
      />
    );
  },
  link(href: string, text: string) {
    return (
      <Link
        href={href as Route}
        className="text-blue-600 dark:text-sky-400 hover:text-blue-600/80 hover:dark:text-sky-400/80 hover:underline transition-all duration-200"
        target="_blank"
        key={crypto.randomUUID()}
      >
        {text}
      </Link>
    );
  },
  code(code: string, type: string) {
    return <CodeRender code={code} type={type} key={crypto.randomUUID()} />;
  },
  inlineCode(code: string) {
    return (
      <code
        key={crypto.randomUUID()}
        className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm"
      >
        {code}
      </code>
    );
  },
};

export default renderer;
