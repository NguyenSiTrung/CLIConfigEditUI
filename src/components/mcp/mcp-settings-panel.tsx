import { useEffect, useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { useMcpStore } from '@/stores/mcp-store';
import { McpServer, McpSyncPreview, McpServerConflict, McpConfigPreview, McpImportResult, McpImportMode, McpDetectedFormat } from '@/types';
import { McpSourceSelector } from './mcp-source-selector';
import { McpServerList } from './mcp-server-list';
import { McpServerEditorModal } from './mcp-server-editor';
import { McpToolStatusList } from './mcp-tool-status';
import { McpSyncPreviewModal } from './mcp-sync-preview-modal';
import { McpConflictResolutionModal } from './mcp-conflict-resolution-modal';
import { McpConfigPreviewModal } from './mcp-config-preview-modal';
import { McpImportPreviewModal } from './mcp-import-preview-modal';
import { toast } from '@/components/toast';
import { ConfirmDialog, McpServerListSkeleton, McpToolStatusListSkeleton } from '@/components/ui';
import { RefreshCw, Plus, AlertCircle, Upload, Loader2, Info, ChevronDown, ChevronUp } from 'lucide-react';

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
    importFromFile,
    executeImport,
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
  
  // Import modal state
  const [isImportPreviewOpen, setIsImportPreviewOpen] = useState(false);
  const [importResult, setImportResult] = useState<McpImportResult | null>(null);

  // Delete confirmation dialog state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [pendingDeleteServerName, setPendingDeleteServerName] = useState<string | null>(null);
  
  // How it works collapse state
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleAddServer = async (server: McpServer) => {
    try {
      await addServer(server);
      toast.success(`Added server "${server.name}"`);
    } catch (err) {
      toast.error(String(err));
    }
  };

  const handleUpdateServer = async (originalName: string, server: McpServer) => {
    try {
      await updateServer(originalName, server);
      toast.success(`Updated server "${server.name}"`);
    } catch (err) {
      toast.error(String(err));
    }
  };

  const handleDeleteServer = async (serverName: string) => {
    setPendingDeleteServerName(serverName);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteServerName) return;
    try {
      await removeServer(pendingDeleteServerName);
      toast.success(`Deleted server "${pendingDeleteServerName}"`);
    } catch (err) {
      toast.error(String(err));
    } finally {
      setIsDeleteConfirmOpen(false);
      setPendingDeleteServerName(null);
    }
  };

  const handleImportFromFile = async () => {
    try {
      const selectedPath = await open({
        multiple: false,
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });

      if (!selectedPath) return; // User cancelled

      const result = await importFromFile(selectedPath);
      
      if (result.servers.length === 0) {
        toast.error('No MCP servers found in the selected file');
        return;
      }

      setImportResult(result);
      setIsImportPreviewOpen(true);
    } catch (err) {
      toast.error(String(err));
    }
  };

  const handleExecuteImport = async (
    selectedServers: McpServer[],
    mode: McpImportMode,
    overwriteMap: Record<string, boolean>
  ) => {
    try {
      await executeImport(selectedServers, mode, overwriteMap);
      setIsImportPreviewOpen(false);
      setImportResult(null);
      toast.success(`Imported ${selectedServers.length} server${selectedServers.length !== 1 ? 's' : ''} successfully`);
    } catch (err) {
      toast.error(String(err));
    }
  };

  const handleSyncAll = async () => {
    try {
      const previews = await previewSyncAll();
      if (previews.some((p) => p.hasChanges)) {
        setIsSyncPreviewOpen(true);
      } else {
        toast.success('All tools are already in sync!');
      }
    } catch (err) {
      toast.error(String(err));
    }
  };

  const handleConfirmSync = async () => {
    try {
      const results = await syncToAll();
      setIsSyncPreviewOpen(false);
      const successCount = results.filter((r) => r.success).length;
      toast.success(`Synced to ${successCount} tool(s)`);
    } catch (err) {
      toast.error(String(err));
    }
  };

  const handleSyncTool = async (toolId: string) => {
    try {
      const preview = await previewSync(toolId);
      
      if (!preview.hasChanges) {
        toast.success(`${preview.toolName} is already in sync!`);
        return;
      }
      
      // Always show preview first, even with conflicts
      setSingleToolPreview(preview);
      setPendingSyncToolId(toolId);
      setIsSyncPreviewOpen(true);
    } catch (err) {
      toast.error(String(err));
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
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error(String(err));
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
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error(String(err));
    }
  };

  const handleViewFullConfig = async (toolId: string, resolvedConflicts?: McpServer[]) => {
    setIsLoadingConfigPreview(true);
    setIsConfigPreviewOpen(true);
    try {
      const preview = await previewConfigContent(toolId, resolvedConflicts);
      setConfigPreview(preview);
    } catch (err) {
      toast.error(String(err));
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
              {isLoading ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading configuration...
                </span>
              ) : (
                'Manage and sync MCP server configurations across tools'
              )}
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
          {/* How MCP Sync Works - Collapsible */}
          <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-200 dark:border-indigo-500/20 overflow-hidden">
            <button
              onClick={() => setIsHowItWorksOpen(!isHowItWorksOpen)}
              className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-indigo-100/50 dark:hover:bg-indigo-500/20 transition-colors"
              aria-expanded={isHowItWorksOpen}
              aria-controls="how-mcp-works-content"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">
                <Info className="w-4 h-4" />
                How MCP Sync Works
              </span>
              {isHowItWorksOpen ? (
                <ChevronUp className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              )}
            </button>
            {isHowItWorksOpen && (
              <div id="how-mcp-works-content" className="px-5 pb-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-200 dark:bg-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-indigo-800 dark:text-indigo-200">Configure Your Source</h4>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
                      Choose where your MCP server definitions come from—manage them in the app or import from Claude Desktop.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-200 dark:bg-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-indigo-800 dark:text-indigo-200">Add MCP Servers</h4>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
                      Define your MCP servers with their commands, arguments, and environment variables.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-200 dark:bg-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-indigo-800 dark:text-indigo-200">Sync to Tools</h4>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
                      Push your configuration to Claude Desktop, Cursor, VS Code, and other supported tools with one click.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

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
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleImportFromFile}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 
                               hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Import from File
                  </button>
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
                </div>
              )}
            </div>
            {isLoading && servers.length === 0 ? (
              <McpServerListSkeleton count={3} />
            ) : (
              <McpServerList
                servers={servers}
                onEdit={(server) => {
                  setEditingServer(server);
                  setIsServerEditorOpen(true);
                }}
                onDelete={handleDeleteServer}
                isEditable={sourceMode === 'app-managed'}
                onAddServer={sourceMode === 'app-managed' ? () => {
                  setEditingServer(undefined);
                  setIsServerEditorOpen(true);
                } : undefined}
                onImportFromFile={sourceMode === 'app-managed' ? handleImportFromFile : undefined}
              />
            )}
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
            {isLoading && toolStatuses.length === 0 ? (
              <McpToolStatusListSkeleton count={4} />
            ) : (
              <McpToolStatusList
                toolStatuses={toolStatuses}
                onToggleEnabled={setToolEnabled}
                onSyncTool={handleSyncTool}
                isSyncing={isLoading}
              />
            )}
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

      {importResult && (
        <McpImportPreviewModal
          isOpen={isImportPreviewOpen}
          servers={importResult.servers}
          sourcePath={importResult.sourcePath}
          detectedFormat={importResult.detectedFormat as McpDetectedFormat}
          existingServers={servers}
          onImport={handleExecuteImport}
          onClose={() => {
            setIsImportPreviewOpen(false);
            setImportResult(null);
          }}
          isLoading={isLoading}
        />
      )}

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete Server"
        message="Are you sure you want to delete this server? This cannot be undone."
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setPendingDeleteServerName(null);
        }}
      />
    </div>
  );
}
