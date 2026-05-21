import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored) return stored;
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch (e) {
      return "light";
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {}
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="fixed z-50 right-4 top-4 w-10 h-10 rounded-md bg-white/90 dark:bg-gray-800/80 shadow flex items-center justify-center transition-colors"
    >
      {theme === "dark" ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-300">
          <path d="M21.64 13a9 9 0 11-9.64-9.64 7 7 0 109.64 9.64z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-800">
          <path d="M12 4.5a1 1 0 011 1V7a1 1 0 11-2 0V5.5a1 1 0 011-1zM12 17a1 1 0 011 1v1.5a1 1 0 11-2 0V18a1 1 0 011-1zM4.5 12a1 1 0 011-1H7a1 1 0 110 2H5.5a1 1 0 01-1-1zM17 12a1 1 0 011-1h1.5a1 1 0 110 2H18a1 1 0 01-1-1zM6.22 6.22a1 1 0 011.41 0l1.06 1.06a1 1 0 11-1.41 1.41L6.22 7.63a1 1 0 010-1.41zM16.31 16.31a1 1 0 011.41 0l1.06 1.06a1 1 0 11-1.41 1.41l-1.06-1.06a1 1 0 010-1.41zM6.22 17.78a1 1 0 010-1.41l1.06-1.06a1 1 0 111.41 1.41L7.63 17.78a1 1 0 01-1.41 0zM16.31 7.69a1 1 0 010-1.41l1.06-1.06a1 1 0 111.41 1.41l-1.06 1.06a1 1 0 01-1.41 0zM12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      )}
    </button>
  );
}
