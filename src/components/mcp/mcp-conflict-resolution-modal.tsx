import { useState, useEffect } from 'react';
import { McpServerConflict, McpServer } from '@/types';
import { X, ArrowRight, Check, AlertTriangle, FileJson } from 'lucide-react';

interface McpConflictResolutionModalProps {
  isOpen: boolean;
  conflicts: McpServerConflict[];
  toolName: string;
  toolId: string;
  onResolve: (resolvedServers: McpServer[]) => void;
  onPreview: (toolId: string, resolvedServers: McpServer[]) => void;
  onClose: () => void;
}

type Resolution = 'source' | 'target';

export function McpConflictResolutionModal({
  isOpen,
  conflicts,
  toolName,
  toolId,
  onResolve,
  onPreview,
  onClose,
}: McpConflictResolutionModalProps) {
  const [resolutions, setResolutions] = useState<Record<string, Resolution>>({});

  // Reset resolutions when conflicts change
  useEffect(() => {
    const initial: Record<string, Resolution> = {};
    conflicts.forEach((c) => {
      initial[c.serverName] = 'source';
    });
    setResolutions(initial);
  }, [conflicts]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getResolvedServers = (): McpServer[] => {
    return conflicts.map((conflict) => {
      const resolution = resolutions[conflict.serverName] || 'source';
      return resolution === 'source'
        ? conflict.sourceServer
        : conflict.targetServer;
    });
  };

  const handleResolve = () => {
    onResolve(getResolvedServers());
  };

  const handlePreview = () => {
    onPreview(toolId, getResolvedServers());
  };

  const setResolution = (serverName: string, resolution: Resolution) => {
    setResolutions((prev) => ({ ...prev, [serverName]: resolution }));
  };

  const formatServerDetails = (server: McpServer) => {
    if (!server) return '(no server data)';
    
    // URL-based server (HTTP/SSE)
    if (server.url) {
      return server.url;
    }
    
    // Command-based server (stdio)
    const parts = [server.command || '(no command)'];
    if (server.args?.length) {
      parts.push(server.args.join(' '));
    }
    return parts.join(' ');
  };

  const formatEnv = (env?: Record<string, string>) => {
    if (!env || Object.keys(env).length === 0) return null;
    return Object.entries(env)
      .map(([k, v]) => `${k}=${v.length > 20 ? v.slice(0, 20) + '...' : v}`)
      .join(', ');
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="glass-panel rounded-xl shadow-2xl w-full max-w-3xl animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-white/5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold dark:text-slate-200 text-slate-800">
              Resolve Conflicts - {toolName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            The following servers have different configurations between your source and {toolName}.
            Choose which version to keep for each server.
          </p>

          {conflicts.map((conflict) => (
            <div
              key={conflict.serverName}
              className="rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden"
            >
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/5">
                <h3 className="font-medium text-sm text-slate-800 dark:text-slate-200">
                  {conflict.serverName}
                </h3>
              </div>

              <div className="p-4 grid grid-cols-2 gap-4">
                {/* Source option */}
                <button
                  onClick={() => setResolution(conflict.serverName, 'source')}
                  className={`relative p-3 rounded-lg border-2 transition-all text-left ${
                    (resolutions[conflict.serverName] || 'source') === 'source'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                      : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  {(resolutions[conflict.serverName] || 'source') === 'source' && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  )}
                  <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-2">
                    Use Source (Sync From)
                  </div>
                  <div className="font-mono text-xs text-slate-700 dark:text-slate-300 break-all">
                    {formatServerDetails(conflict.sourceServer)}
                  </div>
                  {formatEnv(conflict.sourceServer.env) && (
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Env: {formatEnv(conflict.sourceServer.env)}
                    </div>
                  )}
                </button>

                {/* Target option */}
                <button
                  onClick={() => setResolution(conflict.serverName, 'target')}
                  className={`relative p-3 rounded-lg border-2 transition-all text-left ${
                    resolutions[conflict.serverName] === 'target'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10'
                      : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  {resolutions[conflict.serverName] === 'target' && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                  )}
                  <div className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-2">
                    Keep Current ({toolName})
                  </div>
                  <div className="font-mono text-xs text-slate-700 dark:text-slate-300 break-all">
                    {formatServerDetails(conflict.targetServer)}
                  </div>
                  {formatEnv(conflict.targetServer.env) && (
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Env: {formatEnv(conflict.targetServer.env)}
                    </div>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} to resolve
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200
                           rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePreview}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 
                           border border-slate-300 dark:border-white/20 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                <FileJson className="w-4 h-4" />
                Preview Config
              </button>
              <button
                onClick={handleResolve}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 
                           text-white rounded-lg transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
              >
                Apply Resolutions
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
