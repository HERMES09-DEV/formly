"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "dark" | "light";

function getSystemTheme(): Theme {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("formly-theme");
    const initialTheme =
      savedTheme === "dark" || savedTheme === "light"
        ? savedTheme
        : getSystemTheme();

    setTheme(initialTheme);
    applyTheme(initialTheme);
    setIsReady(true);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    const updateTheme = () => {
      setTheme(nextTheme);
      localStorage.setItem("formly-theme", nextTheme);
      applyTheme(nextTheme);
    };
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if ("startViewTransition" in document && !prefersReducedMotion) {
      document.startViewTransition(updateTheme);
      return;
    }

    updateTheme();
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="group inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-all duration-200 ease-out hover:-translate-y-px hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 hover:shadow-sm active:translate-y-0 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:focus:ring-gray-200 dark:focus:ring-offset-gray-900"
    >
      {theme === "dark" ? (
        <Sun
          aria-hidden="true"
          className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45"
        />
      ) : (
        <Moon
          aria-hidden="true"
          className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12"
        />
      )}
      <span>{isReady && theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
