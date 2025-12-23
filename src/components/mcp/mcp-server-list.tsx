import { McpServer } from '@/types';
import { Edit2, Trash2, Terminal, ChevronDown, ChevronUp, PowerOff } from 'lucide-react';
import { useState } from 'react';

interface McpServerListProps {
  servers: McpServer[];
  onEdit: (server: McpServer) => void;
  onDelete: (serverName: string) => void;
  isEditable?: boolean;
}

export function McpServerList({ servers, onEdit, onDelete, isEditable = true }: McpServerListProps) {
  const [expandedServers, setExpandedServers] = useState<Set<string>>(new Set());

  const toggleExpand = (name: string) => {
    const newExpanded = new Set(expandedServers);
    if (newExpanded.has(name)) {
      newExpanded.delete(name);
    } else {
      newExpanded.add(name);
    }
    setExpandedServers(newExpanded);
  };

  if (servers.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 dark:text-slate-500">
        <Terminal className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No MCP servers configured</p>
        <p className="text-xs mt-1">Add a server to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {servers.map((server) => {
        const isExpanded = expandedServers.has(server.name);
        return (
          <div
            key={server.name}
            className={`rounded-lg border transition-all ${
              server.disabled
                ? 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/50 dark:border-white/5 opacity-60'
                : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-white/10'
            }`}
          >
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={() => toggleExpand(server.name)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                  aria-label={isExpanded ? `Collapse ${server.name} details` : `Expand ${server.name} details`}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-sm truncate">
                      {server.name}
                    </span>
                    {server.disabled && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                        <PowerOff className="w-3 h-3" />
                        Disabled
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                    {server.command} {server.args?.join(' ')}
                  </div>
                </div>
              </div>
              {isEditable && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(server)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                    title="Edit server"
                    aria-label={`Edit ${server.name} server`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(server.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                    title="Delete server"
                    aria-label={`Delete ${server.name} server`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            {isExpanded && (
              <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-white/5 mt-1 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500">Command:</span>
                    <span className="ml-2 text-slate-700 dark:text-slate-300 font-mono">
                      {server.command}
                    </span>
                  </div>
                  {server.args && server.args.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-slate-400 dark:text-slate-500">Args:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {server.args.map((arg, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300 font-mono"
                          >
                            {arg}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {server.env && Object.keys(server.env).length > 0 && (
                    <div className="col-span-2">
                      <span className="text-slate-400 dark:text-slate-500">Environment:</span>
                      <div className="mt-1 space-y-1">
                        {Object.entries(server.env).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2 font-mono">
                            <span className="text-amber-600 dark:text-amber-400">{key}</span>
                            <span className="text-slate-400">=</span>
                            <span className="text-slate-600 dark:text-slate-300 truncate">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
