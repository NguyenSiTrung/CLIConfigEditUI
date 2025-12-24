import Editor, { OnMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import { useAppStore } from '@/stores/app-store';
import { useVersionsStore } from '@/stores/versions-store';
import { ConfigFormat } from '@/types';
import { WelcomeScreen } from './welcome-screen';
import { BackupModal } from './backup-modal';
import { VersionsTab } from './versions-tab';
import { OnboardingTooltip } from './ui';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
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
  onSave: () => void;
  onFormat: () => void;
  onAddCustomTool: () => void;
  onOpenSettings?: () => void;
  externalChangeDetected?: boolean;
  onReloadFile?: () => void;
  onDismissExternalChange?: () => void;
}

type EditorTab = 'editor' | 'versions';

export function ConfigEditor({
  onSave,
  onFormat,
  onAddCustomTool,
  onOpenSettings,
  externalChangeDetected,
  onReloadFile,
  onDismissExternalChange,
}: ConfigEditorProps) {
  const {
    editorContent,
    setEditorContent,
    setOriginalContent,
    currentFormat,
    currentFilePath,
    activeToolId,
    activeConfigFileId,
    isDirty,
    isLoading,
    error,
    fileNotFound,
    theme,
    editorSettings,
    sidebarCollapsed,
    backupSettings,
  } = useAppStore();
  
  const { setCurrentConfigId } = useVersionsStore();

  const [showBackupModal, setShowBackupModal] = useState(false);
  const [hasBackups, setHasBackups] = useState(false);
  const [activeTab, setActiveTab] = useState<EditorTab>('editor');
  
  // Monaco editor refs for JSON validation markers
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  // Validate JSON and set Monaco markers for parse errors
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || currentFormat !== 'json') {
      return;
    }
    
    const model = editorRef.current.getModel();
    if (!model) return;
    
    const monaco = monacoRef.current;
    
    try {
      JSON.parse(editorContent);
      // Clear markers on successful parse
      monaco.editor.setModelMarkers(model, 'json-validation', []);
    } catch (err) {
      if (err instanceof SyntaxError) {
        // Parse error message to extract position
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
          const pos = model.getPositionAt(position);
          startLineNumber = pos.lineNumber;
          startColumn = pos.column;
          endLineNumber = pos.lineNumber;
          endColumn = pos.column + 1;
        } else {
          // Default to last character if we can't parse position
          const lineCount = model.getLineCount();
          startLineNumber = lineCount;
          startColumn = 1;
          endLineNumber = lineCount;
          endColumn = model.getLineMaxColumn(lineCount);
        }
        
        monaco.editor.setModelMarkers(model, 'json-validation', [
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

  // Trigger resize when sidebar collapses/expands to fix Monaco layout
  useEffect(() => {
    // Small delay to let the CSS transition complete
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
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
      onSave();
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

  // Memoized calculations - must be before early returns
  const lineCount = useMemo(() => editorContent.split('\n').length, [editorContent]);
  const byteSize = useMemo(() => new Blob([editorContent]).size, [editorContent]);
  const formatInfo = FORMAT_LABELS[currentFormat];

  if (!activeToolId) {
    return <WelcomeScreen onAddCustomTool={onAddCustomTool} />;
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
      {/* Absolute positioning background glow */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>

      {externalChangeDetected && (
        <div className="flex items-center justify-between px-6 py-3 bg-blue-50 dark:bg-blue-500/10 border-b border-blue-200 dark:border-blue-500/20 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3 text-sm text-blue-700 dark:text-blue-300">
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
            <span className="font-medium">File changed externally</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onReloadFile}
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
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200/60 dark:border-white/5 z-10 backdrop-blur-sm bg-white/50 dark:bg-[#020617]/50">
        <div className="flex items-center gap-4 min-w-0 flex-1 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${formatInfo.bg}`}>
              <FileCode className={`w-4 h-4 ${formatInfo.color}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold dark:text-slate-400 text-slate-500 uppercase tracking-widest">{formatInfo.label}</span>
              <span className="text-sm font-medium dark:text-slate-200 text-slate-700 truncate max-w-[400px]" title={currentFilePath || ''}>
                {currentFilePath?.split('/').pop()}
              </span>
            </div>
          </div>

          {isDirty() && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Unsaved Changes</span>
            </div>
          )}
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
              >
                <History className="w-3.5 h-3.5" />
                History
              </button>
            </OnboardingTooltip>
          )}

          {activeTab === 'editor' && (
            <>
              <button
                onClick={onFormat}
                className="px-3 py-1.5 text-xs font-medium flex items-center gap-2 
                           bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 
                           text-slate-600 dark:text-slate-300 rounded-lg 
                           border border-slate-200 dark:border-white/10 transition-all shadow-sm group"
              >
                <AlignLeft className="w-3.5 h-3.5 group-hover:text-indigo-500 transition-colors" />
                Format
              </button>

              <button
                onClick={onSave}
                disabled={!isDirty()}
                className={`px-4 py-1.5 text-xs font-medium flex items-center gap-2 rounded-lg transition-all shadow-sm
                           ${isDirty()
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-700'}`}
              >
                {isDirty() ? <Save className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Save
              </button>
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
                onClick={onSave}
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
              >
                Create File
              </button>
            </div>
          )}
          <div className="flex-1 relative">
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

          <div className="px-5 py-2 text-[11px] font-medium text-slate-500 dark:text-slate-400 
                          border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#020617]
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
                  <span>Auto-save</span>
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
                Ln {lineCount}
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
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
