import { useState, useEffect } from 'react';
import { McpServerConflict, McpServer } from '@/types';
import { Modal, Button } from '@/components/ui';
import { ArrowRight, Check, AlertTriangle, FileJson } from 'lucide-react';

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

  useEffect(() => {
    const initial: Record<string, Resolution> = {};
    conflicts.forEach((c) => {
      initial[c.serverName] = 'source';
    });
    setResolutions(initial);
  }, [conflicts]);

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
    
    if (server.url) {
      return server.url;
    }
    
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

  const headerContent = (
    <div className="flex items-center gap-2">
      <AlertTriangle className="w-5 h-5 text-amber-500" />
      <span>Resolve Conflicts - {toolName}</span>
    </div>
  );

  const footerContent = (
    <div className="flex items-center justify-between w-full">
      <div className="text-sm text-slate-500 dark:text-slate-400">
        {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} to resolve
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="outline" onClick={handlePreview} leftIcon={<FileJson className="w-4 h-4" />}>
          Preview Config
        </Button>
        <Button variant="primary" onClick={handleResolve} rightIcon={<ArrowRight className="w-4 h-4" />}>
          Apply Resolutions
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={headerContent as unknown as string}
      size="full"
      className="max-w-3xl"
      footer={footerContent}
    >
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        The following servers have different configurations between your source and {toolName}.
        Choose which version to keep for each server.
      </p>

      <div className="space-y-4">
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
    </Modal>
  );
}
