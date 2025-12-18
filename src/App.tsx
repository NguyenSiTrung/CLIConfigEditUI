import { useState, useCallback } from 'react';
import { Header, Sidebar, ConfigEditor, AddToolModal, EditToolModal, SettingsModal, ToastContainer, toast } from '@/components';
import { useAppStore } from '@/stores/app-store';
import { useFileWatcher } from '@/hooks';
import { CLI_TOOLS } from '@/utils/cli-tools';
import { invoke } from '@tauri-apps/api/core';
import { ConfigFormat, CustomTool } from '@/types';

function App() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<CustomTool | null>(null);
  const [externalChangeDetected, setExternalChangeDetected] = useState(false);

  const {
    setActiveToolId,
    setEditorContent,
    setOriginalContent,
    setCurrentFilePath,
    setCurrentFormat,
    setLoading,
    setError,
    editorContent,
    currentFilePath,
    addCustomTool,
    updateCustomTool,
    removeCustomTool,
    customTools,
    activeToolId,
    isDirty,
  } = useAppStore();

  const handleExternalChange = useCallback(() => {
    setExternalChangeDetected(true);
  }, []);

  const { markAsInternalWrite } = useFileWatcher(currentFilePath, {
    onExternalChange: handleExternalChange,
  });

  const handleReloadFile = useCallback(async () => {
    if (!currentFilePath) return;
    try {
      const content = await invoke<string>('read_file', { path: currentFilePath });
      setEditorContent(content);
      setOriginalContent(content);
      toast.success('File reloaded');
    } catch (err) {
      toast.error(`Failed to reload: ${err instanceof Error ? err.message : String(err)}`);
    }
    setExternalChangeDetected(false);
  }, [currentFilePath, setEditorContent, setOriginalContent]);

  const handleDismissExternalChange = useCallback(() => {
    setExternalChangeDetected(false);
  }, []);

  const handleToolSelect = useCallback(
    async (toolId: string, isCustom: boolean) => {
      if (isDirty()) {
        const confirmed = window.confirm(
          'You have unsaved changes. Do you want to discard them?'
        );
        if (!confirmed) return;
      }

      setActiveToolId(toolId);
      setLoading(true);
      setError(null);

      try {
        let configPath: string;
        let format: ConfigFormat;

        if (isCustom) {
          const customTool = customTools.find((t) => t.id === toolId);
          if (!customTool) throw new Error('Custom tool not found');
          configPath = customTool.configPath;
          format = customTool.configFormat;
        } else {
          const tool = CLI_TOOLS.find((t) => t.id === toolId);
          if (!tool) throw new Error('Tool not found');
          format = tool.configFormat;

          const result = await invoke<{ path: string; content: string }>(
            'read_config',
            { toolId }
          );
          configPath = result.path;
          setEditorContent(result.content);
          setOriginalContent(result.content);
          setCurrentFilePath(configPath);
          setCurrentFormat(format);
          setLoading(false);
          return;
        }

        const content = await invoke<string>('read_file', { path: configPath });
        setEditorContent(content);
        setOriginalContent(content);
        setCurrentFilePath(configPath);
        setCurrentFormat(format);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setEditorContent('');
        setOriginalContent('');
      } finally {
        setLoading(false);
      }
    },
    [
      isDirty,
      setActiveToolId,
      setLoading,
      setError,
      customTools,
      setEditorContent,
      setOriginalContent,
      setCurrentFilePath,
      setCurrentFormat,
    ]
  );

  const handleSave = useCallback(async () => {
    if (!currentFilePath) return;

    try {
      markAsInternalWrite();
      await invoke('write_file', {
        path: currentFilePath,
        content: editorContent,
      });
      setOriginalContent(editorContent);
      toast.success('Configuration saved successfully');
    } catch (err) {
      toast.error(`Failed to save: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [currentFilePath, editorContent, setOriginalContent, markAsInternalWrite]);

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
        setEditorContent('');
        setOriginalContent('');
        setCurrentFilePath(null);
      }
      toast.success(`Deleted "${tool?.name || 'tool'}"`);
    },
    [customTools, removeCustomTool, activeToolId, setActiveToolId, setEditorContent, setOriginalContent, setCurrentFilePath]
  );

  return (
    <div className="h-full flex flex-col dark:bg-gray-900 bg-slate-100">
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />
      <div className="flex-1 flex min-h-0">
        <Sidebar
          onToolSelect={handleToolSelect}
          onAddCustomTool={() => setIsAddModalOpen(true)}
          onEditCustomTool={handleEditCustomTool}
          onDeleteCustomTool={handleDeleteCustomTool}
        />
        <ConfigEditor
          onSave={handleSave}
          onFormat={handleFormat}
          onAddCustomTool={() => setIsAddModalOpen(true)}
          externalChangeDetected={externalChangeDetected}
          onReloadFile={handleReloadFile}
          onDismissExternalChange={handleDismissExternalChange}
        />
      </div>
      <AddToolModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCustomTool}
      />
      <EditToolModal
        isOpen={editingTool !== null}
        tool={editingTool}
        onClose={() => setEditingTool(null)}
        onSave={handleSaveEditedTool}
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
