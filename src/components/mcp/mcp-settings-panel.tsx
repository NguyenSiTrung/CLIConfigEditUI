import { useEffect, useState } from 'react';
import { useMcpStore } from '@/stores/mcp-store';
import { McpServer, McpSyncPreview, McpServerConflict, McpConfigPreview } from '@/types';
import { McpSourceSelector } from './mcp-source-selector';
import { McpServerList } from './mcp-server-list';
import { McpServerEditorModal } from './mcp-server-editor';
import { McpToolStatusList } from './mcp-tool-status';
import { McpSyncPreviewModal } from './mcp-sync-preview-modal';
import { McpConflictResolutionModal } from './mcp-conflict-resolution-modal';
import { McpConfigPreviewModal } from './mcp-config-preview-modal';
import { RefreshCw, Plus, AlertCircle, CheckCircle } from 'lucide-react';

export function McpSettingsPanel() {
  const {
    sourceMode,
    servers,
    toolStatuses,
    isLoading,
    error,
    loadConfig,
    setSourceMode,
    addServer,
    updateServer,
    removeServer,
    setToolEnabled,
    previewSync,
    previewSyncAll,
    previewConfigContent,
    syncToAll,
    syncToTool,
    clearError,
    syncPreviews,
    activeConflicts,
    setActiveConflicts,
    clearActiveConflicts,
  } = useMcpStore();

  const [isServerEditorOpen, setIsServerEditorOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<McpServer | undefined>();
  const [isSyncPreviewOpen, setIsSyncPreviewOpen] = useState(false);
  const [singleToolPreview, setSingleToolPreview] = useState<McpSyncPreview | null>(null);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [conflictToolName, setConflictToolName] = useState('');
  const [pendingSyncToolId, setPendingSyncToolId] = useState<string | null>(null);
  const [isConfigPreviewOpen, setIsConfigPreviewOpen] = useState(false);
  const [configPreview, setConfigPreview] = useState<McpConfigPreview | null>(null);
  const [isLoadingConfigPreview, setIsLoadingConfigPreview] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleAddServer = async (server: McpServer) => {
    try {
      await addServer(server);
      setToast({ type: 'success', message: `Added server "${server.name}"` });
    } catch (err) {
      setToast({ type: 'error', message: String(err) });
    }
  };

  const handleUpdateServer = async (originalName: string, server: McpServer) => {
    try {
      await updateServer(originalName, server);
      setToast({ type: 'success', message: `Updated server "${server.name}"` });
    } catch (err) {
      setToast({ type: 'error', message: String(err) });
    }
  };

  const handleDeleteServer = async (serverName: string) => {
    if (!confirm(`Delete server "${serverName}"?`)) return;
    try {
      await removeServer(serverName);
      setToast({ type: 'success', message: `Deleted server "${serverName}"` });
    } catch (err) {
      setToast({ type: 'error', message: String(err) });
    }
  };

  const handleSyncAll = async () => {
    try {
      const previews = await previewSyncAll();
      if (previews.some((p) => p.hasChanges)) {
        setIsSyncPreviewOpen(true);
      } else {
        setToast({ type: 'success', message: 'All tools are already in sync!' });
      }
    } catch (err) {
      setToast({ type: 'error', message: String(err) });
    }
  };

  const handleConfirmSync = async () => {
    try {
      const results = await syncToAll();
      setIsSyncPreviewOpen(false);
      const successCount = results.filter((r) => r.success).length;
      setToast({ type: 'success', message: `Synced to ${successCount} tool(s)` });
    } catch (err) {
      setToast({ type: 'error', message: String(err) });
    }
  };

  const handleSyncTool = async (toolId: string) => {
    try {
      const preview = await previewSync(toolId);
      
      if (!preview.hasChanges) {
        setToast({ type: 'success', message: `${preview.toolName} is already in sync!` });
        return;
      }
      
      // Always show preview first, even with conflicts
      setSingleToolPreview(preview);
      setPendingSyncToolId(toolId);
      setIsSyncPreviewOpen(true);
    } catch (err) {
      setToast({ type: 'error', message: String(err) });
    }
  };

  const handleConfirmSingleToolSync = async () => {
    if (!singleToolPreview || !pendingSyncToolId) return;
    try {
      // If there are conflicts and user hasn't resolved them, use source by default
      const result = await syncToTool(pendingSyncToolId);
      setIsSyncPreviewOpen(false);
      setSingleToolPreview(null);
      setPendingSyncToolId(null);
      if (result.success) {
        setToast({ type: 'success', message: result.message });
      } else {
        setToast({ type: 'error', message: result.message });
      }
    } catch (err) {
      setToast({ type: 'error', message: String(err) });
    }
  };

  const handleOpenConflictResolution = (conflicts: McpServerConflict[], toolName: string) => {
    setActiveConflicts(conflicts);
    setConflictToolName(toolName);
    setIsConflictModalOpen(true);
  };

  const handleResolveConflicts = async (resolvedServers: McpServer[]) => {
    if (!pendingSyncToolId) return;
    try {
      const result = await syncToTool(pendingSyncToolId, resolvedServers);
      setIsConflictModalOpen(false);
      setIsSyncPreviewOpen(false);
      clearActiveConflicts();
      setSingleToolPreview(null);
      setPendingSyncToolId(null);
      if (result.success) {
        setToast({ type: 'success', message: result.message });
      } else {
        setToast({ type: 'error', message: result.message });
      }
    } catch (err) {
      setToast({ type: 'error', message: String(err) });
    }
  };

  const handleViewFullConfig = async (toolId: string, resolvedConflicts?: McpServer[]) => {
    setIsLoadingConfigPreview(true);
    setIsConfigPreviewOpen(true);
    try {
      const preview = await previewConfigContent(toolId, resolvedConflicts);
      setConfigPreview(preview);
    } catch (err) {
      setToast({ type: 'error', message: String(err) });
      setIsConfigPreviewOpen(false);
    } finally {
      setIsLoadingConfigPreview(false);
    }
  };

  const enabledToolsCount = toolStatuses.filter((t) => t.enabled && t.installed).length;

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              MCP Settings
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Manage and sync MCP server configurations across tools
            </p>
          </div>
          <button
            onClick={handleSyncAll}
            disabled={isLoading || enabledToolsCount === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 
                       text-white rounded-lg transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Sync All ({enabledToolsCount})
          </button>
        </div>
      </div>

      {/* Toast notifications */}
      {toast && (
        <div
          className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
            toast.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
          <button
            onClick={clearError}
            className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Source Configuration */}
          <section className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/10 p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
              Source Configuration
            </h2>
            <McpSourceSelector
              currentMode={sourceMode}
              serverCount={servers.length}
              onModeChange={setSourceMode}
            />
          </section>

          {/* MCP Servers */}
          <section className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                MCP Servers
              </h2>
              {sourceMode === 'app-managed' && (
                <button
                  onClick={() => {
                    setEditingServer(undefined);
                    setIsServerEditorOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 
                             hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Server
                </button>
              )}
            </div>
            <McpServerList
              servers={servers}
              onEdit={(server) => {
                setEditingServer(server);
                setIsServerEditorOpen(true);
              }}
              onDelete={handleDeleteServer}
              isEditable={sourceMode === 'app-managed'}
            />
            {sourceMode === 'claude' && servers.length > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                Servers imported from ~/.claude.json. Switch to App-Managed mode to edit.
              </p>
            )}
          </section>

          {/* Target Tools */}
          <section className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Target Tools
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Enable tools to sync MCP configuration
                </p>
              </div>
            </div>
            <McpToolStatusList
              toolStatuses={toolStatuses}
              onToggleEnabled={setToolEnabled}
              onSyncTool={handleSyncTool}
              isSyncing={isLoading}
            />
          </section>
        </div>
      </div>

      {/* Modals */}
      <McpServerEditorModal
        isOpen={isServerEditorOpen}
        server={editingServer}
        onSave={(server) => {
          if (editingServer) {
            handleUpdateServer(editingServer.name, server);
          } else {
            handleAddServer(server);
          }
        }}
        onClose={() => {
          setIsServerEditorOpen(false);
          setEditingServer(undefined);
        }}
      />

      <McpSyncPreviewModal
        isOpen={isSyncPreviewOpen}
        previews={singleToolPreview ? [singleToolPreview] : syncPreviews}
        onConfirm={singleToolPreview ? handleConfirmSingleToolSync : handleConfirmSync}
        onResolveConflicts={singleToolPreview ? handleOpenConflictResolution : undefined}
        onViewFullConfig={singleToolPreview ? handleViewFullConfig : undefined}
        onClose={() => {
          setIsSyncPreviewOpen(false);
          setSingleToolPreview(null);
          setPendingSyncToolId(null);
        }}
        isLoading={isLoading}
      />

      <McpConflictResolutionModal
        isOpen={isConflictModalOpen}
        conflicts={activeConflicts}
        toolName={conflictToolName}
        toolId={pendingSyncToolId || ''}
        onResolve={handleResolveConflicts}
        onPreview={handleViewFullConfig}
        onClose={() => {
          setIsConflictModalOpen(false);
          clearActiveConflicts();
        }}
      />

      <McpConfigPreviewModal
        isOpen={isConfigPreviewOpen}
        preview={configPreview}
        onClose={() => {
          setIsConfigPreviewOpen(false);
          setConfigPreview(null);
        }}
        isLoading={isLoadingConfigPreview}
      />
    </div>
  );
}
