"use client";

import * as React from "react";
import { LaptopMinimalIcon, Moon, Sun } from "lucide-react";
import { ThemeProvider, useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      onClick={() =>
        theme === "white"
          ? setTheme("dark")
          : theme === "dark"
            ? setTheme("system")
            : setTheme("white")
      }
    >
      {theme === "white" ? (
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
      ) : theme === "dark" ? (
        <Moon className="absolute h-[1.2rem] w-[1.2rem] transition-all rotate-0 scale-100" />
      ) : (
        <LaptopMinimalIcon className="absolute h-[1.2rem] w-[1.2rem] transition-all rotate-0 scale-100" />
      )}
    </Button>
  );
}
