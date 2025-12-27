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
import { useShallow } from 'zustand/react/shallow';
import { useFileWatcher, useSystemTheme, useReducedMotion, useRecentFiles, useUpdateChecker, useSidebarStateSync } from '@/hooks';
import { invoke } from '@tauri-apps/api/core';
import { ConfigFormat, CustomTool, CliTool, ConfigFile, parseBackendError, isFileNotFoundError, isFileReadError } from '@/types';
import { IDE_PLATFORMS } from '@/utils/cli-tools';
import { getFileName } from '@/utils/path';
import { formatErrorShort } from '@/utils/error-messages';

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

  // Granular selectors for actions (these are stable references)
  const setActiveToolId = useAppStore((state) => state.setActiveToolId);
  const setActiveConfigFileId = useAppStore((state) => state.setActiveConfigFileId);
  const setEditorContent = useAppStore((state) => state.setEditorContent);
  const setOriginalContent = useAppStore((state) => state.setOriginalContent);
  const setCurrentFilePath = useAppStore((state) => state.setCurrentFilePath);
  const setCurrentFormat = useAppStore((state) => state.setCurrentFormat);
  const setCurrentJsonPath = useAppStore((state) => state.setCurrentJsonPath);
  const setCurrentJsonPrefix = useAppStore((state) => state.setCurrentJsonPrefix);
  const setLoading = useAppStore((state) => state.setLoading);
  const setError = useAppStore((state) => state.setError);
  const setFileNotFound = useAppStore((state) => state.setFileNotFound);
  const setFileReadError = useAppStore((state) => state.setFileReadError);
  const clearFileReadError = useAppStore((state) => state.clearFileReadError);
  const addCustomTool = useAppStore((state) => state.addCustomTool);
  const updateCustomTool = useAppStore((state) => state.updateCustomTool);
  const removeCustomTool = useAppStore((state) => state.removeCustomTool);
  const addConfigFile = useAppStore((state) => state.addConfigFile);
  const updateConfigFile = useAppStore((state) => state.updateConfigFile);
  const removeConfigFile = useAppStore((state) => state.removeConfigFile);
  const toggleToolExpanded = useAppStore((state) => state.toggleToolExpanded);
  const getAllTools = useAppStore((state) => state.getAllTools);
  const isDirty = useAppStore((state) => state.isDirty);
  
  // Granular selectors for state values
  const editorContent = useAppStore((state) => state.editorContent);
  const currentFilePath = useAppStore((state) => state.currentFilePath);
  const currentJsonPath = useAppStore((state) => state.currentJsonPath);
  const currentJsonPrefix = useAppStore((state) => state.currentJsonPrefix);
  const activeToolId = useAppStore((state) => state.activeToolId);
  const activeConfigFileId = useAppStore((state) => state.activeConfigFileId);
  
  // Use useShallow for array/object state
  const customTools = useAppStore(useShallow((state) => state.customTools));

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

  // Use refs to read current state in keyboard handler without re-registering
  const sidebarCollapsedRef = useRef(sidebarCollapsed);
  const currentViewRef = useRef(currentView);
  
  useEffect(() => {
    sidebarCollapsedRef.current = sidebarCollapsed;
  }, [sidebarCollapsed]);
  
  useEffect(() => {
    currentViewRef.current = currentView;
  }, [currentView]);

  // Global keyboard shortcuts (stable handler - doesn't re-register on state changes)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if event was already handled
      if (e.defaultPrevented) return;
      
      // Skip when focus is in an input element
      const activeElement = document.activeElement;
      const isInputFocused = activeElement instanceof HTMLInputElement ||
                              activeElement instanceof HTMLTextAreaElement ||
                              activeElement?.getAttribute('contenteditable') === 'true';
      
      // Skip when focus is inside Monaco editor (except for certain global shortcuts)
      const isMonacoFocused = activeElement?.closest('.monaco-editor') !== null;
      
      const isMod = e.metaKey || e.ctrlKey;
      
      // Ctrl/Cmd+K - Command palette (always works - global shortcut)
      if (isMod && e.key === 'k') {
        e.preventDefault();
        setIsQuickOpenMode(false);
        setIsCommandPaletteOpen(true);
        return;
      }
      
      // Ctrl/Cmd+P - Quick Open (file picker) (always works - global shortcut)
      if (isMod && e.key === 'p') {
        e.preventDefault();
        setIsQuickOpenMode(true);
        setIsCommandPaletteOpen(true);
        return;
      }
      
      // Skip remaining shortcuts when focus is in input elements
      if (isInputFocused) return;
      
      // Ctrl/Cmd+, - Settings (skip in Monaco to not interfere with editor)
      if (isMod && e.key === ',' && !isMonacoFocused) {
        e.preventDefault();
        setIsSettingsOpen(true);
        return;
      }
      
      // Ctrl/Cmd+B - Toggle sidebar (skip in Monaco to not interfere with editor)
      if (isMod && e.key === 'b' && !e.shiftKey && !isMonacoFocused) {
        e.preventDefault();
        setSidebarCollapsed(!sidebarCollapsedRef.current);
        return;
      }
      
      // Ctrl/Cmd+Shift+M - Toggle MCP panel (skip in Monaco)
      if (isMod && e.shiftKey && e.key.toLowerCase() === 'm' && !isMonacoFocused) {
        e.preventDefault();
        setCurrentView(currentViewRef.current === 'mcp' ? 'editor' : 'mcp');
        return;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSidebarCollapsed]);

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
      toast.error(formatErrorShort(err, 'Failed to reload'));
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
      clearFileReadError();

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
      } catch (err) {
        const backendError = parseBackendError(err);
        
        if (isFileNotFoundError(backendError)) {
          // File doesn't exist - show default content for new file
          const defaultContent = configFile.jsonPath ? '{}' : getDefaultContent(configFile.format);
          setEditorContent(defaultContent);
          setOriginalContent(defaultContent);
          setCurrentFilePath(configFile.path);
          setCurrentFormat(configFile.format);
          setCurrentJsonPath(configFile.jsonPath || null);
          setFileNotFound(true);
        } else if (isFileReadError(backendError)) {
          // Parse/permission error - show error banner, block editing
          setEditorContent('');
          setOriginalContent('');
          setCurrentFilePath(configFile.path);
          setCurrentFormat(configFile.format);
          setCurrentJsonPath(configFile.jsonPath || null);
          setFileReadError(backendError);
        } else {
          // Unknown error - treat as file not found for backward compatibility
          const defaultContent = configFile.jsonPath ? '{}' : getDefaultContent(configFile.format);
          setEditorContent(defaultContent);
          setOriginalContent(defaultContent);
          setCurrentFilePath(configFile.path);
          setCurrentFormat(configFile.format);
          setCurrentJsonPath(configFile.jsonPath || null);
          setFileNotFound(true);
        }

        // Still track recent file even if there's an error
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
      setFileReadError,
      clearFileReadError,
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
      clearFileReadError();

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
      } catch (err) {
        const backendError = parseBackendError(err);
        
        if (isFileNotFoundError(backendError)) {
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
        } else if (isFileReadError(backendError)) {
          setEditorContent('');
          setOriginalContent('');
          setCurrentFilePath(settingsPath);
          setCurrentFormat('json');
          if (settingPath) {
            setCurrentJsonPath(settingPath);
            setCurrentJsonPrefix(null);
          } else {
            setCurrentJsonPath(null);
            setCurrentJsonPrefix(prefix);
          }
          setFileReadError(backendError);
        } else {
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
        }
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
      setFileReadError,
      clearFileReadError,
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
      toast.error(formatErrorShort(err, 'Failed to save'));
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
            onOpenKeyboardShortcuts={() => setIsKeyboardShortcutsOpen(true)}
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
        fileName={getFileName(currentFilePath)}
      />
      <ToastContainer />
    </div>
  );
}

export default App;
