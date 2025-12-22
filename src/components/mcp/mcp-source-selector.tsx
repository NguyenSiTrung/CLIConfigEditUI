import { McpSourceMode } from '@/types';
import { FileJson, Database, Check } from 'lucide-react';

interface McpSourceSelectorProps {
  currentMode: McpSourceMode;
  serverCount: number;
  onModeChange: (mode: McpSourceMode) => void;
}

export function McpSourceSelector({ currentMode, serverCount, onModeChange }: McpSourceSelectorProps) {
  const options: { mode: McpSourceMode; label: string; description: string; icon: typeof FileJson }[] = [
    {
      mode: 'claude',
      label: 'Import from Claude',
      description: 'Read MCP servers from ~/.claude.json',
      icon: FileJson,
    },
    {
      mode: 'app-managed',
      label: 'App-Managed',
      description: 'Manage MCP servers within this app',
      icon: Database,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium dark:text-slate-300 text-slate-700">
          MCP Source
        </label>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {serverCount} server{serverCount !== 1 ? 's' : ''} configured
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {options.map(({ mode, label, description, icon: Icon }) => (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            className={`p-3 rounded-lg border text-left transition-all ${
              currentMode === mode
                ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500/50 ring-1 ring-indigo-500/30'
                : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${
                  currentMode === mode
                    ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-medium text-sm ${
                      currentMode === mode
                        ? 'text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {label}
                  </span>
                  {currentMode === mode && (
                    <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
