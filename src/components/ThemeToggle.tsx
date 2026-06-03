'use client';
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <button className="p-2 rounded-full bg-gray-100 dark:bg-white/10 text-transparent flex items-center justify-center w-9 h-9 shadow-inner" aria-label="Toggle theme placeholder"></button>;
  }

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button 
      onClick={toggle}
      className="p-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300 transition-colors flex items-center justify-center shadow-inner"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
