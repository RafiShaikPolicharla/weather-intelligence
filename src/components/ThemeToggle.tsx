import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      id="theme-toggle"
      className="p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white/85 dark:bg-zinc-900 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <div className="flex items-center gap-2">
          <Moon size={18} className="text-indigo-600 animate-pulse" />
          <span className="text-xs font-semibold select-none pr-1">Dark Mode</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Sun size={18} className="text-amber-500 animate-spin-slow" />
          <span className="text-xs font-semibold select-none pr-1">Light Mode</span>
        </div>
      )}
    </button>
  );
}
