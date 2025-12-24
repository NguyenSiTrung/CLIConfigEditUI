import { Settings, Moon, Sun, Terminal, Sparkles, Minus, Square, X, Server, Search } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { APP_VERSION } from '@/constants/design-tokens';
import { formatShortcut } from '@/hooks/use-keyboard-shortcut';
import { OnboardingTooltip } from './ui';
import { UpdateBadge } from './update-modal';

export type AppView = 'editor' | 'mcp';

interface HeaderProps {
  onSettingsClick?: () => void;
  currentView?: AppView;
  onViewChange?: (view: AppView) => void;
  onCommandPaletteClick?: () => void;
  updateAvailable?: boolean;
  updateVersion?: string;
  onUpdateClick?: () => void;
}

const appWindow = getCurrentWindow();

export function Header({ onSettingsClick, currentView = 'editor', onViewChange, onCommandPaletteClick, updateAvailable, updateVersion, onUpdateClick }: HeaderProps) {
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
      className="titlebar h-12 flex items-center justify-between select-none
                 bg-slate-50 dark:bg-[#020617]
                 border-b border-slate-200/60 dark:border-white/5
                 backdrop-blur-md z-50 relative"
      onMouseDown={handleStartDrag}
    >
      {/* Absolute gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50"></div>

      {/* Left side - App branding */}
      <div className="flex items-center gap-3 pl-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-indigo-500 blur opacity-20 dark:opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
            <Terminal className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-sm font-bold dark:text-slate-200 text-slate-800 tracking-tight leading-none mb-0.5">CLI Config Editor</h1>
          <div className="flex items-center gap-1.5 opacity-60">
            <span className="text-xs font-medium dark:text-slate-400 text-slate-500 uppercase tracking-widest">v{APP_VERSION}</span>
            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
          </div>
        </div>
        {updateAvailable && updateVersion && onUpdateClick && (
          <UpdateBadge onClick={onUpdateClick} version={updateVersion} />
        )}
      </div>

      {/* Center - View tabs */}
      <div className="flex-1 flex items-center justify-center gap-1">
        <button
          onClick={() => onViewChange?.('editor')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            currentView === 'editor'
              ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
          aria-label="Switch to Configs view"
          aria-pressed={currentView === 'editor'}
        >
          <Terminal className="w-3.5 h-3.5" />
          Configs
        </button>
        <button
          onClick={() => onViewChange?.('mcp')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            currentView === 'mcp'
              ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
          aria-label="Switch to MCP Sync view"
          aria-pressed={currentView === 'mcp'}
        >
          <Server className="w-3.5 h-3.5" />
          MCP Sync
        </button>
      </div>

      {/* Right side - Actions and window controls */}
      <div className="flex items-center h-full pr-2 gap-2">
        {/* Command Palette button */}
        <OnboardingTooltip
          id="command-palette-hint"
          title="Quick Actions"
          description={`Press ${formatShortcut({ ctrl: true, key: 'K' })} to open the command palette for quick access to all actions.`}
          position="bottom"
          delay={3000}
        >
          <button
            onClick={onCommandPaletteClick}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg
                       bg-slate-100 dark:bg-white/5 
                       hover:bg-slate-200 dark:hover:bg-white/10
                       border border-slate-200/60 dark:border-white/10
                       text-slate-500 dark:text-slate-400
                       hover:text-slate-700 dark:hover:text-slate-200
                       transition-all duration-200
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
            title={`Command Palette (${formatShortcut({ ctrl: true, key: 'K' })})`}
            aria-label="Open command palette"
          >
            <Search className="w-3.5 h-3.5" />
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400">
              {formatShortcut({ ctrl: true, key: 'K' })}
            </kbd>
          </button>
        </OnboardingTooltip>

        {/* App actions */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-200/50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 mr-2">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 
                       hover:text-slate-800 dark:hover:text-slate-200 
                       hover:bg-white dark:hover:bg-white/10 
                       transition-all duration-200
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
            title={theme === 'dark' ? 'Switch to light mode (more options in Settings)' : 'Switch to dark mode (more options in Settings)'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <div className="w-[1px] h-4 bg-slate-300 dark:bg-white/10 mx-0.5"></div>
          <button
            onClick={onSettingsClick}
            className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 
                       hover:text-slate-800 dark:hover:text-slate-200 
                       hover:bg-white dark:hover:bg-white/10 
                       transition-all duration-200
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
            title={`Settings (${formatShortcut({ ctrl: true, key: ',' })})`}
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Window controls */}
        <div className="flex items-center gap-1 h-full pl-2 border-l border-slate-200 dark:border-white/5">
          <button
            onClick={handleMinimize}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
            title="Minimize"
            aria-label="Minimize window"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={handleMaximize}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
            title="Maximize"
            aria-label="Maximize window"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-red-500 transition-colors
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
            title="Close"
            aria-label="Close window"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
