"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

/** Only ever rendered while on a themed route (/hub, /kitchen) - see Header. */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      aria-pressed={isLight}
      className={`relative h-8 w-14 shrink-0 rounded-full border border-(--hm-text)/15 bg-(--hm-text)/8 transition-colors hover:border-(--hm-text)/30 ${className}`}
    >
      <span
        className={`absolute top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-(--hm-text) text-(--hm-bg) shadow-sm transition-transform duration-200 ${
          isLight ? "translate-x-[26px]" : "translate-x-0.5"
        }`}
      >
        {isLight ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}
