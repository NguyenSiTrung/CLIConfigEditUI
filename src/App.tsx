import { useState, useCallback, useEffect } from 'react';
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
} from '@/components';
import { useAppStore } from '@/stores/app-store';
import { useFileWatcher } from '@/hooks';
import { invoke } from '@tauri-apps/api/core';
import { ask } from '@tauri-apps/plugin-dialog';
import { ConfigFormat, CustomTool, CliTool, ConfigFile } from '@/types';

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
  const [editingTool, setEditingTool] = useState<CustomTool | null>(null);
  const [addConfigFileTool, setAddConfigFileTool] = useState<CliTool | CustomTool | null>(null);
  const [editingConfigFile, setEditingConfigFile] = useState<{ tool: CliTool | CustomTool; configFile: ConfigFile } | null>(null);
  const [externalChangeDetected, setExternalChangeDetected] = useState(false);

  const {
    setActiveToolId,
    setActiveConfigFileId,
    setEditorContent,
    setOriginalContent,
    setCurrentFilePath,
    setCurrentFormat,
    setCurrentJsonPath,
    setLoading,
    setError,
    editorContent,
    currentFilePath,
    currentJsonPath,
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

  // Auto-expand tools on first load
  useEffect(() => {
    const tools = getAllTools();
    tools.forEach((tool) => {
      const configFiles = useAppStore.getState().getToolConfigFiles(tool.id);
      if (configFiles.length > 0) {
        const { expandedTools } = useAppStore.getState();
        if (!expandedTools.has(tool.id)) {
          toggleToolExpanded(tool.id);
        }
      }
    });
  }, [getAllTools, toggleToolExpanded]);

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

  const handleConfigFileSelect = useCallback(
    async (toolId: string, configFile: ConfigFile) => {
      if (isDirty()) {
        const confirmed = await ask(
          'You have unsaved changes. Do you want to discard them?',
          { title: 'Unsaved Changes', kind: 'warning' }
        );
        if (!confirmed) return;
      }

      setActiveToolId(toolId);
      setActiveConfigFileId(configFile.id);
      setLoading(true);
      setError(null);

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
      } catch {
        // File doesn't exist or jsonPath not found - create with default content
        const defaultContent = configFile.jsonPath ? '{}' : getDefaultContent(configFile.format);
        setEditorContent(defaultContent);
        setOriginalContent(defaultContent);
        setCurrentFilePath(configFile.path);
        setCurrentFormat(configFile.format);
        setCurrentJsonPath(configFile.jsonPath || null);
        setError(`File not found. It will be created when you save.`);
      } finally {
        setLoading(false);
      }
    },
    [
      isDirty,
      setActiveToolId,
      setActiveConfigFileId,
      setLoading,
      setError,
      setEditorContent,
      setOriginalContent,
      setCurrentFilePath,
      setCurrentFormat,
      setCurrentJsonPath,
    ]
  );

  const handleSave = useCallback(async () => {
    if (!currentFilePath) return;

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
      toast.success('Configuration saved successfully');
    } catch (err) {
      toast.error(`Failed to save: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [currentFilePath, currentJsonPath, editorContent, setOriginalContent, markAsInternalWrite, setError]);

  const handleFormat = useCallback(() => {
    try {
      const format = useAppStore.getState().currentFormat;
      if (format === 'json') {
        const formatted = JSON.stringify(JSON.parse(editorContent), null, 2);
        setEditorContent(formatted);
        toast.success('Code formatted');
      } else {
        toast.info(`Formatting for ${format.toUpperCase()} coming soon`);
      }
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
    <div className="h-full flex flex-col dark:bg-gray-900 bg-slate-100">
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />
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
        />
        <ConfigEditor
          onSave={handleSave}
          onFormat={handleFormat}
          onAddCustomTool={() => setIsAddToolModalOpen(true)}
          externalChangeDetected={externalChangeDetected}
          onReloadFile={handleReloadFile}
          onDismissExternalChange={handleDismissExternalChange}
        />
      </div>
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
      />
      <ToastContainer />
    </div>
  );
}

export default App;
