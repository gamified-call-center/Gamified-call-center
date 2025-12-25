"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import clsx from "clsx";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // On load → sync from localStorage / html class
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = stored === "dark";

    setIsDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);

    document.documentElement.classList.toggle("dark", nextTheme);
    localStorage.setItem("theme", nextTheme ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className={clsx(
        "flex items-center gap-3 rounded-xl border px-4 py-2 transition-all",
        "bg-white text-gray-900 border-gray-200",
        "dark:bg-cardDark dark:text-gray-100 dark:border-gray-700",
        "hover:shadow-sm"
      )}
    >
      <div
        className={clsx(
          "flex h-8 w-8 items-center justify-center rounded-lg",
          isDark ? "bg-gray-800 text-yellow-400" : "bg-gray-100 text-gray-700"
        )}
      >
        {isDark ? <Moon size={16} /> : <Sun size={16} />}
      </div>

      <span className="text-sm font-Gordita-Medium">
        {isDark ? "Dark Mode" : "Light Mode"}
      </span>
    </button>
  );
}
