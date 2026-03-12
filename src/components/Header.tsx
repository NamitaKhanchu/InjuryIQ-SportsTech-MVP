import React from 'react';
import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 lg:px-8 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search athletes, teams, or prescriptions..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border-none rounded-full text-sm focus:ring-2 focus:ring-accent/50 transition-all dark:text-white"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <button className="relative p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-status-red rounded-full border-2 border-white dark:border-[#020617] animate-pulse" />
        </button>
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 lg:hidden" />
      </div>
    </header>
  );
}
