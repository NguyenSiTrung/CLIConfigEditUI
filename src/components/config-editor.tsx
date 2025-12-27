import Editor, { OnMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import { useAppStore } from '@/stores/app-store';
import { useVersionsStore } from '@/stores/versions-store';
import { ConfigFormat } from '@/types';
import { useShallow } from 'zustand/react/shallow';
import { WelcomeScreen } from './welcome-screen';
import { BackupModal } from './backup-modal';
import { VersionsTab } from './versions-tab';
import { EditorErrorBanner } from './editor-error-banner';
import { OnboardingTooltip, Modal, Button } from './ui';
import { useState, useEffect, useCallback, useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { formatShortcut } from '@/hooks/use-keyboard-shortcut';
import { getFileName } from '@/utils/path';
import {
  Save,
  AlignLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
  X,
  History,
  FileCode,
  CheckCircle2,
  Layers,
  FilePlus,
  Settings,
} from 'lucide-react';

const FORMAT_TO_LANGUAGE: Record<ConfigFormat, string> = {
  json: 'json',
  yaml: 'yaml',
  toml: 'ini',
  ini: 'ini',
  md: 'markdown',
};

const FORMAT_LABELS: Record<ConfigFormat, { label: string; color: string; bg: string }> = {
  json: { label: 'JSON', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  yaml: { label: 'YAML', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  toml: { label: 'TOML', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
  ini: { label: 'INI', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  md: { label: 'MD', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
};

interface ConfigEditorProps {
  onSave: (isAutoSave?: boolean) => void;
  onFormat: () => void;
  onAddCustomTool: () => void;
  onOpenSettings?: () => void;
  onSwitchToMcp?: () => void;
  externalChangeDetected?: boolean;
  onReloadFile?: () => void;
  onDismissExternalChange?: () => void;
}

export interface ConfigEditorHandle {
  triggerFind: () => void;
}

type EditorTab = 'editor' | 'versions';

export const ConfigEditor = forwardRef<ConfigEditorHandle, ConfigEditorProps>(function ConfigEditor({
  onSave,
  onFormat,
  onAddCustomTool,
  onOpenSettings,
  onSwitchToMcp,
  externalChangeDetected,
  onReloadFile,
  onDismissExternalChange,
}, ref) {
  // Granular selectors to reduce re-renders
  const editorContent = useAppStore((state) => state.editorContent);
  const setEditorContent = useAppStore((state) => state.setEditorContent);
  const setOriginalContent = useAppStore((state) => state.setOriginalContent);
  const currentFormat = useAppStore((state) => state.currentFormat);
  const currentFilePath = useAppStore((state) => state.currentFilePath);
  const activeToolId = useAppStore((state) => state.activeToolId);
  const activeConfigFileId = useAppStore((state) => state.activeConfigFileId);
  const isDirty = useAppStore((state) => state.isDirty);
  const isLoading = useAppStore((state) => state.isLoading);
  const error = useAppStore((state) => state.error);
  const fileNotFound = useAppStore((state) => state.fileNotFound);
  const fileReadError = useAppStore((state) => state.fileReadError);
  const clearFileReadError = useAppStore((state) => state.clearFileReadError);
  const theme = useAppStore((state) => state.theme);
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  
  // Use useShallow for objects to prevent unnecessary re-renders
  const editorSettings = useAppStore(useShallow((state) => state.editorSettings));
  const backupSettings = useAppStore(useShallow((state) => state.backupSettings));
  
  const { setCurrentConfigId } = useVersionsStore();

  const [showBackupModal, setShowBackupModal] = useState(false);
  const [hasBackups, setHasBackups] = useState(false);
  const [activeTab, setActiveTab] = useState<EditorTab>('editor');
  const [showReloadWarning, setShowReloadWarning] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<{ line: number; column: number }>({ line: 1, column: 1 });
  
  // Monaco editor refs for JSON validation markers
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);

  // Cursor position update throttling
  const cursorPositionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cursorListenerRef = useRef<Monaco.IDisposable | null>(null);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Throttle cursor position updates to 100ms
    cursorListenerRef.current = editor.onDidChangeCursorPosition((e) => {
      if (cursorPositionTimeoutRef.current) {
        clearTimeout(cursorPositionTimeoutRef.current);
      }
      cursorPositionTimeoutRef.current = setTimeout(() => {
        setCursorPosition({ line: e.position.lineNumber, column: e.position.column });
      }, 100);
    });
  };

  // Cleanup Monaco event listeners
  useEffect(() => {
    return () => {
      if (cursorListenerRef.current) {
        cursorListenerRef.current.dispose();
        cursorListenerRef.current = null;
      }
      if (cursorPositionTimeoutRef.current) {
        clearTimeout(cursorPositionTimeoutRef.current);
        cursorPositionTimeoutRef.current = null;
      }
    };
  }, []);

  // Expose triggerFind to parent via ref
  useImperativeHandle(ref, () => ({
    triggerFind: () => {
      if (editorRef.current) {
        editorRef.current.focus();
        editorRef.current.trigger('keyboard', 'actions.find', null);
      }
    },
  }), []);

  // Debounced JSON validation (500ms) to reduce validation frequency during typing
  // Skip validation for large files (>1MB) to prevent performance issues
  useEffect(() => {
    const LARGE_FILE_THRESHOLD = 1024 * 1024; // 1MB
    
    if (!editorRef.current || !monacoRef.current || currentFormat !== 'json') {
      return;
    }
    
    // Skip validation for large files
    if (editorContent.length > LARGE_FILE_THRESHOLD) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelMarkers(model, 'json-validation', []);
      }
      return;
    }
    
    const model = editorRef.current.getModel();
    if (!model) return;
    
    const monaco = monacoRef.current;
    
    const validateJson = () => {
      const currentModel = editorRef.current?.getModel();
      if (!currentModel) return;
      
      try {
        JSON.parse(editorContent);
        monaco.editor.setModelMarkers(currentModel, 'json-validation', []);
      } catch (err) {
        if (err instanceof SyntaxError) {
          const message = err.message;
          const posMatch = message.match(/position (\d+)/i);
          const lineColMatch = message.match(/line (\d+) column (\d+)/i);
          
          let startLineNumber = 1;
          let startColumn = 1;
          let endLineNumber = 1;
          let endColumn = 1;
          
          if (lineColMatch) {
            startLineNumber = parseInt(lineColMatch[1], 10);
            startColumn = parseInt(lineColMatch[2], 10);
            endLineNumber = startLineNumber;
            endColumn = startColumn + 1;
          } else if (posMatch) {
            const position = parseInt(posMatch[0].replace('position ', ''), 10);
            const pos = currentModel.getPositionAt(position);
            startLineNumber = pos.lineNumber;
            startColumn = pos.column;
            endLineNumber = pos.lineNumber;
            endColumn = pos.column + 1;
          } else {
            const lineCount = currentModel.getLineCount();
            startLineNumber = lineCount;
            startColumn = 1;
            endLineNumber = lineCount;
            endColumn = currentModel.getLineMaxColumn(lineCount);
          }
          
          monaco.editor.setModelMarkers(currentModel, 'json-validation', [
            {
              severity: monaco.MarkerSeverity.Error,
              message: message.replace(/^JSON\.parse: /, '').replace(/^Unexpected token.*/, 'Syntax error'),
              startLineNumber,
              startColumn,
              endLineNumber,
              endColumn,
            },
          ]);
        }
      }
    };
    
    const debounceTimer = setTimeout(validateJson, 500);
    return () => clearTimeout(debounceTimer);
  }, [editorContent, currentFormat]);

  // Sync versions store with current config file
  useEffect(() => {
    setCurrentConfigId(activeConfigFileId);
  }, [activeConfigFileId, setCurrentConfigId]);

  const checkBackups = useCallback(async () => {
    if (!currentFilePath) {
      setHasBackups(false);
      return;
    }
    try {
      const backups = await invoke<{ path: string }[]>('list_backups', { path: currentFilePath });
      setHasBackups(backups.length > 0);
    } catch {
      setHasBackups(false);
    }
  }, [currentFilePath]);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkBackups();
    }, 300);
    return () => clearTimeout(timer);
  }, [checkBackups]);

  // Trigger Monaco layout when sidebar collapses/expands
  useEffect(() => {
    // Small delay to let the CSS transition complete
    const timer = setTimeout(() => {
      requestAnimationFrame(() => {
        editorRef.current?.layout();
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [sidebarCollapsed]);

  // Auto-save functionality
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastAutoSaved, setLastAutoSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (!editorSettings.autoSave || !currentFilePath || !isDirty()) {
      return;
    }

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      onSave(true);
      setLastAutoSaved(new Date());
    }, editorSettings.autoSaveDelay);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [editorContent, editorSettings.autoSave, editorSettings.autoSaveDelay, currentFilePath, isDirty, onSave]);

  const handleBackupRestored = useCallback(() => {
    onReloadFile?.();
    checkBackups();
  }, [onReloadFile, checkBackups]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      onSave();
    }
  };

  const handleApplyVersion = useCallback((content: string) => {
    setEditorContent(content);
    setOriginalContent(content);
    setActiveTab('editor');
  }, [setEditorContent, setOriginalContent]);

  const handleReloadClick = useCallback(() => {
    if (isDirty()) {
      setShowReloadWarning(true);
    } else {
      onReloadFile?.();
    }
  }, [isDirty, onReloadFile]);

  const handleKeepEdits = useCallback(() => {
    setShowReloadWarning(false);
    onDismissExternalChange?.();
  }, [onDismissExternalChange]);

  const handleReloadAndDiscard = useCallback(() => {
    setShowReloadWarning(false);
    onReloadFile?.();
  }, [onReloadFile]);

  // Memoized calculations - must be before early returns
  const lineCount = useMemo(() => editorContent.split('\n').length, [editorContent]);
  const byteSize = useMemo(() => new Blob([editorContent]).size, [editorContent]);
  const formatInfo = FORMAT_LABELS[currentFormat];

  if (!activeToolId) {
    return <WelcomeScreen onAddCustomTool={onAddCustomTool} onOpenSettings={onOpenSettings} onSwitchToMcp={onSwitchToMcp} />;
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-w-0 bg-white dark:bg-[#020617]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
            <Loader2 className="relative w-10 h-10 animate-spin text-blue-500" />
          </div>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading configuration...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-w-0 bg-white dark:bg-[#020617]">
        <div className="text-center max-w-md p-8 glass-panel rounded-2xl shadow-xl">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold dark:text-slate-200 text-slate-800 mb-2">Failed to load config</h3>
          <p className="dark:text-slate-400 text-slate-500 mb-6">{error}</p>
          {currentFilePath && (
            <div className="text-xs font-mono dark:bg-black/30 bg-slate-100 p-4 rounded-lg break-all text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5">
              {currentFilePath}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-[#020617] relative" onKeyDown={handleKeyDown}>


      {externalChangeDetected && (
        <div className="flex items-center justify-between px-6 py-3 bg-blue-50 dark:bg-blue-500/10 border-b border-blue-200 dark:border-blue-500/20 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3 text-sm text-blue-700 dark:text-blue-300">
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
            <span className="font-medium">File changed externally</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReloadClick}
              className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
            >
              Reload Content
            </button>
            <button
              onClick={onDismissExternalChange}
              className="p-1 text-blue-500 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/20 rounded-full transition-colors
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
              aria-label="Dismiss external change notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200/60 dark:border-white/5 z-10 bg-slate-50 dark:bg-slate-900/80">
        <div className="flex items-center gap-4 min-w-0 flex-1 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${formatInfo.bg}`}>
              <FileCode className={`w-4 h-4 ${formatInfo.color}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold dark:text-slate-400 text-slate-500 uppercase tracking-widest">{formatInfo.label}</span>
              <span className="text-sm font-medium dark:text-slate-200 text-slate-700 truncate max-w-[400px]" title={currentFilePath || ''}>
                {getFileName(currentFilePath)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Tab Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 mr-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5
                ${activeTab === 'editor' 
                  ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              aria-label="Switch to Editor tab"
              aria-pressed={activeTab === 'editor'}
            >
              <FileCode className="w-3.5 h-3.5" />
              Editor
            </button>
            <OnboardingTooltip
              id="versions-tab-hint"
              title="Version History"
              description="Track changes over time. Compare versions and restore previous configurations easily."
              position="bottom"
              delay={2000}
            >
              <button
                onClick={() => setActiveTab('versions')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5
                  ${activeTab === 'versions' 
                    ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                aria-label="Switch to Versions tab"
                aria-pressed={activeTab === 'versions'}
              >
                <Layers className="w-3.5 h-3.5" />
                Versions
              </button>
            </OnboardingTooltip>
          </div>

          {hasBackups && activeTab === 'editor' && (
            <OnboardingTooltip
              id="backups-hint"
              title="File Backups"
              description="Automatic backups are created before each save. Restore any previous version from here."
              position="bottom"
              delay={3000}
            >
              <button
                onClick={() => setShowBackupModal(true)}
                className="px-3 py-1.5 text-xs font-medium flex items-center gap-2 
                           bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 
                           text-slate-600 dark:text-slate-300 rounded-lg 
                           border border-slate-200 dark:border-white/10 transition-all shadow-sm"
                aria-label="Open file backups"
              >
                <History className="w-3.5 h-3.5" />
                File Backups
              </button>
            </OnboardingTooltip>
          )}

          {activeTab === 'editor' && (
            <>
              <span title={currentFormat === 'json' ? 'Format document' : 'Formatting supported for JSON only'}>
                <button
                  onClick={onFormat}
                  disabled={currentFormat !== 'json'}
                  className={`px-3 py-1.5 text-xs font-medium flex items-center gap-2 rounded-lg transition-all shadow-sm
                             ${currentFormat === 'json'
                      ? 'bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 group'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-700'}`}
                  aria-label={currentFormat === 'json' ? 'Format JSON document' : 'Formatting only available for JSON'}
                >
                  <AlignLeft className={`w-3.5 h-3.5 ${currentFormat === 'json' ? 'group-hover:text-indigo-500 transition-colors' : ''}`} />
                  Format
                </button>
              </span>

              {isDirty() ? (
                <button
                  onClick={() => onSave()}
                  disabled={!!fileReadError}
                  className={`btn-primary px-4 py-1.5 text-xs font-medium flex items-center gap-2 rounded-lg transition-all shadow-sm
                             ${fileReadError 
                               ? 'bg-slate-400 cursor-not-allowed opacity-60' 
                               : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95'}`}
                  aria-label="Save changes"
                  title={fileReadError ? 'Cannot save: file has errors' : `Save (${formatShortcut({ ctrl: true, key: 'S' })})`}
                >
                  <Save className="w-3.5 h-3.5" />
                  Save
                  <kbd className="ml-1 px-1.5 py-0.5 text-[10px] font-medium bg-white/20 rounded opacity-75">
                    {formatShortcut({ ctrl: true, key: 'S' })}
                  </kbd>
                </button>
              ) : (
                <span className="px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {activeTab === 'editor' ? (
        <>
          {fileNotFound && (
            <div className="flex items-center gap-3 px-5 py-3 bg-emerald-50 dark:bg-emerald-500/10 border-b border-emerald-200 dark:border-emerald-500/20 backdrop-blur-sm z-10">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                <FilePlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                  New file
                </span>
                <span className="text-sm text-emerald-600 dark:text-emerald-400 ml-2">
                  — This file doesn't exist yet. It will be created when you save.
                </span>
              </div>
              <button
                onClick={() => onSave()}
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
              >
                Create File
              </button>
            </div>
          )}
          <div className="flex-1 relative">
            {fileReadError && (
              <EditorErrorBanner
                error={fileReadError}
                onDismiss={clearFileReadError}
              />
            )}
            <Editor
              height="100%"
              language={FORMAT_TO_LANGUAGE[currentFormat]}
              value={editorContent}
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              options={{
                minimap: { enabled: editorSettings.minimap },
                fontSize: editorSettings.fontSize || 13,
                fontFamily: editorSettings.fontFamily || "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                lineNumbers: editorSettings.lineNumbers,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: editorSettings.tabSize,
                wordWrap: editorSettings.wordWrap,
                formatOnPaste: true,
                padding: { top: 16, bottom: 16 },
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                renderLineHighlight: 'all',
                lineHeight: 1.6,
                bracketPairColorization: { enabled: true },
              }}
            />
          </div>

          <div className="px-5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 
                          border-t border-slate-200/80 dark:border-white/5 bg-slate-50 dark:bg-slate-900/80
                          flex items-center justify-between select-none">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-help" title="Path">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500"></span>
                {currentFilePath}
              </span>
              {editorSettings.autoSave && (
                <span 
                  className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"
                  title={lastAutoSaved ? `Last auto-saved: ${lastAutoSaved.toLocaleTimeString()}` : 'Auto-save enabled'}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-subtle"></span>
                  <span className={lastAutoSaved ? 'animate-fade-in' : ''}>
                    {lastAutoSaved 
                      ? `Auto-saved at ${lastAutoSaved.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}`
                      : 'Auto-save'}
                  </span>
                </span>
              )}
              {!backupSettings.enabled && (
                <button
                  onClick={onOpenSettings}
                  className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                  title="Click to enable backups in Settings"
                >
                  <Settings className="w-3 h-3" />
                  <span>Backups disabled</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                Ln {cursorPosition.line}, Col {cursorPosition.column}
              </span>
              <span className="flex items-center gap-1.5">
                {lineCount} lines
              </span>
              <span className="flex items-center gap-1.5">
                {formatBytes(byteSize)}
              </span>
              <span className="uppercase opacity-70">UTF-8</span>
              <span className="uppercase opacity-70">{currentFormat}</span>
            </div>
          </div>
        </>
      ) : (
        <VersionsTab onApplyVersion={handleApplyVersion} />
      )}

      <BackupModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        filePath={currentFilePath || ''}
        currentContent={editorContent}
        onRestored={handleBackupRestored}
      />

      <Modal
        isOpen={showReloadWarning}
        onClose={() => setShowReloadWarning(false)}
        title="Unsaved Changes"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowReloadWarning(false)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={handleKeepEdits}>
              Keep my edits
            </Button>
            <Button variant="danger" onClick={handleReloadAndDiscard}>
              Reload and discard
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          You have unsaved changes. Reloading will discard them.
        </p>
      </Modal>
    </div>
  );
});

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
