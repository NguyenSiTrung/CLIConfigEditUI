import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Header,
  Sidebar,
  ConfigEditor,
  AddToolModal,
  EditToolModal,
  AddConfigFileModal,
  EditConfigFileModal,
  SettingsModal,
  ToastContainer,
  toast,
  McpSettingsPanel,
  KeyboardShortcutsModal,
  UpdateModal,
} from '@/components';
import type { ConfigEditorHandle } from '@/components/config-editor';
import { CommandPalette } from '@/components/command-palette';
import { UnsavedChangesDialog, type UnsavedChangesAction } from '@/components/ui';
import type { AppView } from '@/components';
import { useAppStore } from '@/stores/app-store';
import { useFileWatcher, useSystemTheme, useReducedMotion, useRecentFiles, useUpdateChecker, useSidebarStateSync } from '@/hooks';
import { invoke } from '@tauri-apps/api/core';
import { ConfigFormat, CustomTool, CliTool, ConfigFile } from '@/types';
import { IDE_PLATFORMS } from '@/utils/cli-tools';

function getDefaultContent(format: ConfigFormat): string {
  switch (format) {
    case 'json':
      return '{\n  \n}\n';
    case 'yaml':
      return '# Configuration\n\n';
    case 'toml':
      return '# Configuration\n\n';
    case 'ini':
      return '; Configuration\n\n';
    case 'md':
      return '# Instructions\n\n';
    default:
      return '';
  }
}

function App() {
  const [isAddToolModalOpen, setIsAddToolModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickOpenMode, setIsQuickOpenMode] = useState(false);
  const [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<CustomTool | null>(null);
  const [addConfigFileTool, setAddConfigFileTool] = useState<CliTool | CustomTool | null>(null);
  const [editingConfigFile, setEditingConfigFile] = useState<{ tool: CliTool | CustomTool; configFile: ConfigFile } | null>(null);
  const [externalChangeDetected, setExternalChangeDetected] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('editor');
  
  const [isUnsavedDialogOpen, setIsUnsavedDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const pendingNavigationRef = useRef<(() => Promise<void>) | null>(null);
  const configEditorRef = useRef<ConfigEditorHandle>(null);

  const {
    setActiveToolId,
    setActiveConfigFileId,
    setEditorContent,
    setOriginalContent,
    setCurrentFilePath,
    setCurrentFormat,
    setCurrentJsonPath,
    setCurrentJsonPrefix,
    setLoading,
    setError,
    setFileNotFound,
    editorContent,
    currentFilePath,
    currentJsonPath,
    currentJsonPrefix,
    addCustomTool,
    updateCustomTool,
    removeCustomTool,
    customTools,
    activeToolId,
    activeConfigFileId,
    isDirty,
    addConfigFile,
    updateConfigFile,
    removeConfigFile,
    toggleToolExpanded,
    getAllTools,
  } = useAppStore();

  const { recentFiles, addRecentFile, clearRecentFiles } = useRecentFiles();

  const {
    updateAvailable,
    updateInfo,
    isInstalling,
    installProgress,
    downloadAndInstall,
    dismissUpdate,
  } = useUpdateChecker(true);

  useSystemTheme();
  useReducedMotion();
  useSidebarStateSync();

  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore((state) => state.setSidebarCollapsed);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      
      // Ctrl/Cmd+K - Command palette
      if (isMod && e.key === 'k') {
        e.preventDefault();
        setIsQuickOpenMode(false);
        setIsCommandPaletteOpen(true);
        return;
      }
      
      // Ctrl/Cmd+P - Quick Open (file picker)
      if (isMod && e.key === 'p') {
        e.preventDefault();
        setIsQuickOpenMode(true);
        setIsCommandPaletteOpen(true);
        return;
      }
      
      // Ctrl/Cmd+, - Settings
      if (isMod && e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen(true);
        return;
      }
      
      // Ctrl/Cmd+B - Toggle sidebar
      if (isMod && e.key === 'b' && !e.shiftKey) {
        e.preventDefault();
        setSidebarCollapsed(!sidebarCollapsed);
        return;
      }
      
      // Ctrl/Cmd+Shift+M - Toggle MCP panel
      if (isMod && e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setCurrentView(currentView === 'mcp' ? 'editor' : 'mcp');
        return;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarCollapsed, setSidebarCollapsed, currentView]);

  const handleExternalChange = useCallback(() => {
    setExternalChangeDetected(true);
  }, []);

  const { markAsInternalWrite } = useFileWatcher(currentFilePath, {
    onExternalChange: handleExternalChange,
  });

  const handleReloadFile = useCallback(async () => {
    if (!currentFilePath) return;
    try {
      let content: string;
      if (currentJsonPath) {
        content = await invoke<string>('read_json_path', {
          path: currentFilePath,
          jsonPath: currentJsonPath
        });
      } else {
        content = await invoke<string>('read_file', { path: currentFilePath });
      }
      setEditorContent(content);
      setOriginalContent(content);
      toast.success('File reloaded');
    } catch (err) {
      toast.error(`Failed to reload: ${err instanceof Error ? err.message : String(err)}`);
    }
    setExternalChangeDetected(false);
  }, [currentFilePath, currentJsonPath, setEditorContent, setOriginalContent]);

  const handleDismissExternalChange = useCallback(() => {
    setExternalChangeDetected(false);
  }, []);

  const performConfigFileSelect = useCallback(
    async (toolId: string, configFile: ConfigFile) => {
      setActiveToolId(toolId);
      setActiveConfigFileId(configFile.id);
      setLoading(true);
      setError(null);
      setFileNotFound(false);

      // Get tool name for recent files tracking
      const allTools = getAllTools();
      const tool = allTools.find((t) => t.id === toolId);
      const toolName = tool?.name || toolId;

      try {
        let content: string;
        if (configFile.jsonPath) {
          content = await invoke<string>('read_json_path', {
            path: configFile.path,
            jsonPath: configFile.jsonPath
          });
        } else {
          content = await invoke<string>('read_file', { path: configFile.path });
        }
        setEditorContent(content);
        setOriginalContent(content);
        setCurrentFilePath(configFile.path);
        setCurrentFormat(configFile.format);
        setCurrentJsonPath(configFile.jsonPath || null);
        setFileNotFound(false);

        // Track recent file
        addRecentFile({
          toolId,
          toolName,
          configId: configFile.id,
          configLabel: configFile.label,
          path: configFile.path,
        });
      } catch {
        const defaultContent = configFile.jsonPath ? '{}' : getDefaultContent(configFile.format);
        setEditorContent(defaultContent);
        setOriginalContent(defaultContent);
        setCurrentFilePath(configFile.path);
        setCurrentFormat(configFile.format);
        setCurrentJsonPath(configFile.jsonPath || null);
        setFileNotFound(true);

        // Still track recent file even if it's new
        addRecentFile({
          toolId,
          toolName,
          configId: configFile.id,
          configLabel: configFile.label,
          path: configFile.path,
        });
      } finally {
        setLoading(false);
      }
    },
    [
      setActiveToolId,
      setActiveConfigFileId,
      setLoading,
      setError,
      setFileNotFound,
      setEditorContent,
      setOriginalContent,
      setCurrentFilePath,
      setCurrentFormat,
      setCurrentJsonPath,
      getAllTools,
      addRecentFile,
    ]
  );

  const handleConfigFileSelect = useCallback(
    (toolId: string, configFile: ConfigFile) => {
      if (isDirty()) {
        pendingNavigationRef.current = () => performConfigFileSelect(toolId, configFile);
        setIsUnsavedDialogOpen(true);
        return;
      }
      performConfigFileSelect(toolId, configFile);
    },
    [isDirty, performConfigFileSelect]
  );

  const performIdeExtensionConfigSelect = useCallback(
    async (platformId: string, extensionId: string, settingPath: string | null) => {
      const platform = IDE_PLATFORMS.find(p => p.id === platformId);
      if (!platform) {
        toast.error(`Platform "${platformId}" not found`);
        return;
      }

      const currentOs = await invoke<string>('get_current_os');
      const settingsPath = platform.settingsPaths[currentOs as keyof typeof platform.settingsPaths];
      if (!settingsPath) {
        toast.error(`No settings path for ${platform.name} on ${currentOs}`);
        return;
      }

      const extConfig = platform.extensions?.find(e => e.extensionId === extensionId);
      const prefix = extConfig?.jsonPathPrefix || 'amp';

      setActiveToolId(`ide-${platformId}`);
      setActiveConfigFileId(`${platformId}-${settingPath || 'all'}`);
      setLoading(true);
      setError(null);
      setFileNotFound(false);

      try {
        let content: string;
        if (settingPath) {
          content = await invoke<string>('read_json_path', {
            path: settingsPath,
            jsonPath: settingPath,
          });
          setCurrentJsonPath(settingPath);
          setCurrentJsonPrefix(null);
        } else {
          content = await invoke<string>('read_json_prefix', {
            path: settingsPath,
            prefix: prefix,
          });
          setCurrentJsonPath(null);
          setCurrentJsonPrefix(prefix);
        }
        setEditorContent(content);
        setOriginalContent(content);
        setCurrentFilePath(settingsPath);
        setCurrentFormat('json');
        setFileNotFound(false);
      } catch {
        const defaultContent = '{}';
        setEditorContent(defaultContent);
        setOriginalContent(defaultContent);
        setCurrentFilePath(settingsPath);
        setCurrentFormat('json');
        if (settingPath) {
          setCurrentJsonPath(settingPath);
          setCurrentJsonPrefix(null);
        } else {
          setCurrentJsonPath(null);
          setCurrentJsonPrefix(prefix);
        }
        setFileNotFound(true);
      } finally {
        setLoading(false);
      }
    },
    [
      setActiveToolId,
      setActiveConfigFileId,
      setLoading,
      setError,
      setFileNotFound,
      setEditorContent,
      setOriginalContent,
      setCurrentFilePath,
      setCurrentFormat,
      setCurrentJsonPath,
      setCurrentJsonPrefix,
    ]
  );

  const handleIdeExtensionConfigSelect = useCallback(
    (platformId: string, extensionId: string, settingPath: string | null) => {
      if (isDirty()) {
        pendingNavigationRef.current = () => performIdeExtensionConfigSelect(platformId, extensionId, settingPath);
        setIsUnsavedDialogOpen(true);
        return;
      }
      performIdeExtensionConfigSelect(platformId, extensionId, settingPath);
    },
    [isDirty, performIdeExtensionConfigSelect]
  );

  const handleSave = useCallback(async (isAutoSave?: boolean): Promise<boolean> => {
    if (!currentFilePath) return false;

    const { backupSettings } = useAppStore.getState();

    try {
      markAsInternalWrite();
      if (currentJsonPath) {
        await invoke('write_json_path', {
          path: currentFilePath,
          jsonPath: currentJsonPath,
          content: editorContent,
          backupSettings: {
            enabled: backupSettings.enabled,
            maxBackups: backupSettings.maxBackups,
          },
        });
      } else if (currentJsonPrefix) {
        await invoke('write_json_prefix', {
          path: currentFilePath,
          prefix: currentJsonPrefix,
          content: editorContent,
          backupSettings: {
            enabled: backupSettings.enabled,
            maxBackups: backupSettings.maxBackups,
          },
        });
      } else {
        await invoke('write_file', {
          path: currentFilePath,
          content: editorContent,
          backupSettings: {
            enabled: backupSettings.enabled,
            maxBackups: backupSettings.maxBackups,
          },
        });
      }
      setOriginalContent(editorContent);
      setError(null);
      setFileNotFound(false);
      if (!isAutoSave) {
        toast.success('Configuration saved successfully');
      }
      return true;
    } catch (err) {
      toast.error(`Failed to save: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }, [currentFilePath, currentJsonPath, currentJsonPrefix, editorContent, setOriginalContent, markAsInternalWrite, setError, setFileNotFound]);

  const handleUnsavedChangesAction = useCallback(async (action: UnsavedChangesAction) => {
    if (action === 'cancel') {
      setIsUnsavedDialogOpen(false);
      pendingNavigationRef.current = null;
      return;
    }
    
    if (action === 'save') {
      setIsSaving(true);
      const saved = await handleSave();
      setIsSaving(false);
      if (!saved) {
        return;
      }
    }
    
    setIsUnsavedDialogOpen(false);
    if (pendingNavigationRef.current) {
      await pendingNavigationRef.current();
      pendingNavigationRef.current = null;
    }
  }, [handleSave]);

  const handleFormat = useCallback(() => {
    try {
      const formatted = JSON.stringify(JSON.parse(editorContent), null, 2);
      setEditorContent(formatted);
      toast.success('Code formatted');
    } catch {
      toast.error('Failed to format: Invalid syntax');
    }
  }, [editorContent, setEditorContent]);

  const handleAddCustomTool = useCallback(
    (tool: { name: string; configPath: string; configFormat: ConfigFormat; description?: string }) => {
      addCustomTool(tool);
      toast.success(`Added "${tool.name}" to custom tools`);
    },
    [addCustomTool]
  );

  const handleEditCustomTool = useCallback((tool: CustomTool) => {
    setEditingTool(tool);
  }, []);

  const handleSaveEditedTool = useCallback(
    (id: string, updates: Partial<CustomTool>) => {
      updateCustomTool(id, updates);
      toast.success('Custom tool updated');
    },
    [updateCustomTool]
  );

  const handleDeleteCustomTool = useCallback(
    (toolId: string) => {
      const tool = customTools.find((t) => t.id === toolId);
      removeCustomTool(toolId);
      if (activeToolId === toolId) {
        setActiveToolId(null);
        setActiveConfigFileId(null);
        setEditorContent('');
        setOriginalContent('');
        setCurrentFilePath(null);
      }
      toast.success(`Deleted "${tool?.name || 'tool'}"`);
    },
    [customTools, removeCustomTool, activeToolId, setActiveToolId, setActiveConfigFileId, setEditorContent, setOriginalContent, setCurrentFilePath]
  );

  const handleAddConfigFile = useCallback((tool: CliTool) => {
    setAddConfigFileTool(tool);
  }, []);

  const handleSaveNewConfigFile = useCallback(
    (configFile: { label: string; path: string; format: ConfigFormat; icon?: string }) => {
      if (!addConfigFileTool) return;

      addConfigFile(addConfigFileTool.id, configFile);
      toast.success(`Added "${configFile.label}" to ${addConfigFileTool.name}`);

      // Auto-expand the tool
      const { expandedTools } = useAppStore.getState();
      if (!expandedTools.has(addConfigFileTool.id)) {
        toggleToolExpanded(addConfigFileTool.id);
      }
    },
    [addConfigFileTool, addConfigFile, toggleToolExpanded]
  );

  const handleEditConfigFile = useCallback((tool: CliTool | CustomTool, configFile: ConfigFile) => {
    setEditingConfigFile({ tool, configFile });
  }, []);

  const handleSaveEditedConfigFile = useCallback(
    (updates: Partial<ConfigFile>) => {
      if (!editingConfigFile) return;

      updateConfigFile(editingConfigFile.tool.id, editingConfigFile.configFile.id, updates);
      toast.success('Config file updated');

      // Update current file path if this is the active config
      if (activeConfigFileId === editingConfigFile.configFile.id && updates.path) {
        setCurrentFilePath(updates.path);
      }
      if (activeConfigFileId === editingConfigFile.configFile.id && updates.format) {
        setCurrentFormat(updates.format);
      }
    },
    [editingConfigFile, updateConfigFile, activeConfigFileId, setCurrentFilePath, setCurrentFormat]
  );

  const handleDeleteConfigFile = useCallback(
    (toolId: string, configFileId: string) => {
      removeConfigFile(toolId, configFileId);

      if (activeToolId === toolId && activeConfigFileId === configFileId) {
        setActiveToolId(null);
        setActiveConfigFileId(null);
        setEditorContent('');
        setOriginalContent('');
        setCurrentFilePath(null);
      }

      toast.success('Config file removed');
    },
    [removeConfigFile, activeToolId, activeConfigFileId, setActiveToolId, setActiveConfigFileId, setEditorContent, setOriginalContent, setCurrentFilePath]
  );

  const handleAddCustomToolConfigFile = useCallback((tool: CustomTool) => {
    setAddConfigFileTool(tool);
  }, []);

  const handleEditCustomToolConfigFile = useCallback((tool: CustomTool, configFile: ConfigFile) => {
    setEditingConfigFile({ tool, configFile });
  }, []);

  return (
    <div className="h-full flex flex-col dark:bg-[#020617] bg-slate-50 overflow-hidden text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30">
      <Header 
        onSettingsClick={() => setIsSettingsOpen(true)}
        currentView={currentView}
        onViewChange={setCurrentView}
        onCommandPaletteClick={() => setIsCommandPaletteOpen(true)}
        updateAvailable={updateAvailable}
        updateVersion={updateInfo?.version}
        onUpdateClick={() => setIsUpdateModalOpen(true)}
      />
      {currentView === 'editor' ? (
        <div className="flex-1 flex min-h-0">
          <Sidebar
            onConfigFileSelect={handleConfigFileSelect}
            onAddConfigFile={handleAddConfigFile}
            onEditConfigFile={handleEditConfigFile}
            onDeleteConfigFile={handleDeleteConfigFile}
            onAddCustomTool={() => setIsAddToolModalOpen(true)}
            onEditCustomTool={handleEditCustomTool}
            onDeleteCustomTool={handleDeleteCustomTool}
            onAddCustomToolConfigFile={handleAddCustomToolConfigFile}
            onEditCustomToolConfigFile={handleEditCustomToolConfigFile}
            onIdeExtensionConfigSelect={handleIdeExtensionConfigSelect}
          />
          <ConfigEditor
            ref={configEditorRef}
            onSave={handleSave}
            onFormat={handleFormat}
            onAddCustomTool={() => setIsAddToolModalOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onSwitchToMcp={() => setCurrentView('mcp')}
            externalChangeDetected={externalChangeDetected}
            onReloadFile={handleReloadFile}
            onDismissExternalChange={handleDismissExternalChange}
          />
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <McpSettingsPanel />
        </div>
      )}
      <AddToolModal
        isOpen={isAddToolModalOpen}
        onClose={() => setIsAddToolModalOpen(false)}
        onAdd={handleAddCustomTool}
      />
      <EditToolModal
        isOpen={editingTool !== null}
        tool={editingTool}
        onClose={() => setEditingTool(null)}
        onSave={handleSaveEditedTool}
      />
      <AddConfigFileModal
        isOpen={addConfigFileTool !== null}
        tool={addConfigFileTool}
        onClose={() => setAddConfigFileTool(null)}
        onAdd={handleSaveNewConfigFile}
      />
      <EditConfigFileModal
        isOpen={editingConfigFile !== null}
        configFile={editingConfigFile?.configFile || null}
        toolName={editingConfigFile?.tool.name || ''}
        onClose={() => setEditingConfigFile(null)}
        onSave={handleSaveEditedConfigFile}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenKeyboardShortcuts={() => setIsKeyboardShortcutsOpen(true)}
      />
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => {
          setIsCommandPaletteOpen(false);
          setIsQuickOpenMode(false);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onAddCustomTool={() => setIsAddToolModalOpen(true)}
        onSwitchToMcp={() => setCurrentView('mcp')}
        onSwitchToEditor={() => setCurrentView('editor')}
        onOpenKeyboardShortcuts={() => setIsKeyboardShortcutsOpen(true)}
        onFindInFile={() => configEditorRef.current?.triggerFind()}
        isQuickOpenMode={isQuickOpenMode}
        recentFiles={recentFiles}
        onFileSelect={handleConfigFileSelect}
        onClearRecentFiles={clearRecentFiles}
      />
      <KeyboardShortcutsModal
        isOpen={isKeyboardShortcutsOpen}
        onClose={() => setIsKeyboardShortcutsOpen(false)}
      />
      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        updateInfo={updateInfo}
        onDownloadAndInstall={downloadAndInstall}
        isInstalling={isInstalling}
        installProgress={installProgress}
        onDismiss={dismissUpdate}
      />
      <UnsavedChangesDialog
        isOpen={isUnsavedDialogOpen}
        onClose={() => {
          setIsUnsavedDialogOpen(false);
          pendingNavigationRef.current = null;
        }}
        onAction={handleUnsavedChangesAction}
        isSaving={isSaving}
        fileName={currentFilePath?.split('/').pop()}
      />
      <ToastContainer />
    </div>
  );
}

export default App;
