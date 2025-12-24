"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-[86px]" />; // prevents layout shift

  const active = theme === "system" ? systemTheme : theme;
  const isDark = active === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm
                 text-zinc-800 hover:bg-zinc-50 transition
                 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      title="Toggle theme"
    >
      <span className="font-medium">{isDark ? "Dark" : "Light"}</span>
      <span className={`h-2.5 w-2.5 rounded-full ${isDark ? "bg-emerald-400" : "bg-zinc-400"}`} />
    </button>
  );
}
