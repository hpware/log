"use client";

import { GithubIcon } from "lucide-react";
import Link from "next/link";

export default function PromoBlock() {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 rounded p-5 m-1 flex flex-row justify-center text-center align-middle">
      <div className="flex flex-col">
        <Link
          href="https://github.com/hpware/log"
          className="block justiy-center bg-white dark:bg-black border m-auto p-2 rounded hover:bg-amber-100 dark:border-white dark:hover:bg-amber-100/40 transition-all duration-300"
        >
          <GithubIcon className="w-[100px] h-[100px] p-4" />
        </Link>
      </div>
      <div className="text-center justify-center flex flex-col p-5 m-5">
        <span>
          This project is currently at {"**"} of stars on GitHub, if you want to
          support the project, consider finding issues & star the project!
        </span>
      </div>
    </div>
  );
}
