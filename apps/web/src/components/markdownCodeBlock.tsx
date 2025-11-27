"use client";
import { Highlight, themes } from "prism-react-renderer";
import { useTheme } from "next-themes";
import { Ubuntu } from "next/font/google";
const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["400"],
});
export default function CodeRender({
  code,
  type,
}: {
  code: string;
  type?: string;
}) {
  const { theme } = useTheme();
  return (
    <div className="rounded-lg overflow-hidden my-4 max-h-full max-w-full">
      <div className="flex items-center justify-between px-4 py-2 bg-sky-200 dark:bg-gray-800">
        <span
          className={`text-sm ${ubuntu.variable} text-black text-gray-800 dark:text-gray-200`}
        >
          {type || "text"}
        </span>
      </div>
      <Highlight
        theme={theme === "dark" ? themes.nightOwl : themes.nightOwlLight}
        code={code}
        language={type || "text"}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className="p-4 overflow-auto bg-gray-900" style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                <span key={i} className="text-gray-500 select-none mr-4">
                  {i + 1}
                </span>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
