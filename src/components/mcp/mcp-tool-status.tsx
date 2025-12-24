import { McpToolStatus, McpSyncStatus } from '@/types';
import { Check, AlertTriangle, RefreshCw, XCircle, Minus, ToggleLeft, ToggleRight } from 'lucide-react';

interface McpToolStatusListProps {
  toolStatuses: McpToolStatus[];
  onToggleEnabled: (toolId: string, enabled: boolean) => void;
  onSyncTool: (toolId: string) => void;
  isSyncing?: boolean;
}

const STATUS_CONFIG: Record<
  McpSyncStatus,
  { label: string; color: string; icon: typeof Check; canSync: boolean }
> = {
  synced: {
    label: 'Synced',
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',
    icon: Check,
    canSync: false,
  },
  'out-of-sync': {
    label: 'Out of Sync',
    color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10',
    icon: RefreshCw,
    canSync: true,
  },
  conflicts: {
    label: 'Conflicts',
    color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10',
    icon: AlertTriangle,
    canSync: true,
  },
  'not-installed': {
    label: 'Not Installed',
    color: 'text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800',
    icon: XCircle,
    canSync: false,
  },
  'no-mcp': {
    label: 'No MCP Config',
    color: 'text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800',
    icon: Minus,
    canSync: true,
  },
};

export function McpToolStatusList({
  toolStatuses,
  onToggleEnabled,
  onSyncTool,
  isSyncing,
}: McpToolStatusListProps) {
  return (
    <div className="space-y-2" role="list">
      {toolStatuses.map((status) => {
        const config = STATUS_CONFIG[status.syncStatus];
        const StatusIcon = config.icon;

        return (
          <div
            key={status.toolId}
            role="listitem"
            tabIndex={0}
            className={`p-3 rounded-lg border transition-all
              focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
              dark:focus-visible:ring-offset-slate-900
              ${
              status.installed
                ? 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-white/10'
                : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/50 dark:border-white/5 opacity-60'
            }`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (status.installed) {
                  onToggleEnabled(status.toolId, !status.enabled);
                }
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleEnabled(status.toolId, !status.enabled)}
                  disabled={!status.installed}
                  className={`p-1 rounded transition-colors ${
                    status.enabled
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-300 dark:text-slate-600'
                  } ${status.installed ? 'hover:bg-slate-100 dark:hover:bg-white/5' : 'cursor-not-allowed'}`}
                  title={status.enabled ? 'Disable sync' : 'Enable sync'}
                  aria-label={`${status.enabled ? 'Disable' : 'Enable'} sync for ${status.name}`}
                >
                  {status.enabled ? (
                    <ToggleRight className="w-5 h-5" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                </button>
                <div>
                  <div className="font-medium text-sm text-slate-800 dark:text-slate-200">
                    {status.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {status.configPath}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {status.installed && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {status.serverCount} server{status.serverCount !== 1 ? 's' : ''}
                  </span>
                )}
                <span
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {config.label}
                </span>
                {status.enabled && config.canSync && status.installed && (
                  <button
                    onClick={() => onSyncTool(status.toolId)}
                    disabled={isSyncing}
                    className="px-2 py-1 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 
                               text-white rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Sync MCP settings for ${status.name}`}
                  >
                    Sync
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
