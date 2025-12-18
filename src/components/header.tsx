import { Settings, Moon, Sun, Terminal, Sparkles, Minus, Square, X } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';

interface HeaderProps {
  onSettingsClick?: () => void;
}

const appWindow = getCurrentWindow();

export function Header({ onSettingsClick }: HeaderProps) {
  const { theme, toggleTheme } = useAppStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleMinimize = async () => {
    await appWindow.minimize();
  };

  const handleMaximize = async () => {
    await appWindow.toggleMaximize();
  };

  const handleClose = async () => {
    await appWindow.close();
  };

  const handleStartDrag = async (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    await appWindow.startDragging();
  };

  return (
    <header 
      className="titlebar h-10 dark:bg-gradient-to-r dark:from-[#1a1a2e] dark:via-[#16213e] dark:to-[#1a1a2e] bg-gradient-to-r from-slate-100 via-slate-50 to-blue-50/50 border-b dark:border-gray-700/30 border-slate-200/60 flex items-center justify-between select-none"
      onMouseDown={handleStartDrag}
    >
      {/* Left side - App branding */}
      <div className="titlebar flex items-center gap-2.5 pl-3 flex-1">
        <div className="relative group pointer-events-none">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-md">
            <Terminal className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 pointer-events-none">
          <h1 className="text-xs font-semibold dark:text-gray-200 text-slate-700 tracking-tight">CLI Config Editor</h1>
          <Sparkles className="w-2.5 h-2.5 text-amber-500 dark:text-amber-400" />
        </div>
      </div>

      {/* Right side - Actions and window controls */}
      <div className="flex items-center h-full">
        {/* App actions */}
        <div className="flex items-center gap-0.5 pr-2 mr-2 border-r dark:border-gray-700/50 border-slate-200/80">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md dark:text-gray-400 text-slate-500 dark:hover:text-white hover:text-slate-800 dark:hover:bg-white/10 hover:bg-slate-200/60 transition-all duration-150"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onSettingsClick}
            className="p-1.5 rounded-md dark:text-gray-400 text-slate-500 dark:hover:text-white hover:text-slate-800 dark:hover:bg-white/10 hover:bg-slate-200/60 transition-all duration-150"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Window controls */}
        <div className="flex items-center h-full">
          <button
            onClick={handleMinimize}
            className="h-full px-3 dark:text-gray-400 text-slate-500 dark:hover:text-white hover:text-slate-800 dark:hover:bg-white/10 hover:bg-slate-200/60 transition-colors duration-150"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleMaximize}
            className="h-full px-3 dark:text-gray-400 text-slate-500 dark:hover:text-white hover:text-slate-800 dark:hover:bg-white/10 hover:bg-slate-200/60 transition-colors duration-150"
            title="Maximize"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={handleClose}
            className="h-full px-3 dark:text-gray-400 text-slate-500 hover:text-white hover:bg-red-500 dark:hover:bg-red-500 transition-colors duration-150"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
