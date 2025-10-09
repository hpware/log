"use client";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import { useEffect, useState } from "react";
export default function Navigation() {
  const links = [{ to: "/", label: "another path" }] as const;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      <div
        className={`${scrolled ? "mt-2 shadow py-2 rounded-xs" : "py-2 mt-1"} z-50 w-[calc(100%-10px)] mx-1 border-1 border-gray-900  dark:border-white fixed inset-x-0 text-center bg-white dark:bg-black flex flex-row items-center justify-between px-2 transition-all duration-300`}
      >
        <div className="flex gap-2 text-lg">
          <Link
            href="/"
            className="pl-2 geist-mono transition-all duration-300"
          >
            logs
          </Link>
          <nav className="md:flex md:gap-4">
            {links.map(({ to, label }) => {
              return (
                <Link key={to} href={to} className="">
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
