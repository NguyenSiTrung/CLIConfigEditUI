import Editor from '@monaco-editor/react';
import { useAppStore } from '@/stores/app-store';
import { ConfigFormat } from '@/types';
import { WelcomeScreen } from './welcome-screen';
import {
  Save,
  AlignLeft,
  FileJson,
  FileCode,
  Loader2,
  AlertCircle,
  FileText,
  RefreshCw,
  X,
} from 'lucide-react';

const FORMAT_TO_LANGUAGE: Record<ConfigFormat, string> = {
  json: 'json',
  yaml: 'yaml',
  toml: 'ini',
  ini: 'ini',
  md: 'markdown',
};

const FORMAT_LABELS: Record<ConfigFormat, { label: string; icon: React.ReactNode }> = {
  json: { label: 'JSON', icon: <FileJson className="w-3 h-3" /> },
  yaml: { label: 'YAML', icon: <FileCode className="w-3 h-3" /> },
  toml: { label: 'TOML', icon: <FileText className="w-3 h-3" /> },
  ini: { label: 'INI', icon: <FileText className="w-3 h-3" /> },
  md: { label: 'Markdown', icon: <FileText className="w-3 h-3" /> },
};

interface ConfigEditorProps {
  onSave: () => void;
  onFormat: () => void;
  onAddCustomTool: () => void;
  externalChangeDetected?: boolean;
  onReloadFile?: () => void;
  onDismissExternalChange?: () => void;
}

export function ConfigEditor({ 
  onSave, 
  onFormat, 
  onAddCustomTool,
  externalChangeDetected,
  onReloadFile,
  onDismissExternalChange,
}: ConfigEditorProps) {
  const {
    editorContent,
    setEditorContent,
    currentFormat,
    currentFilePath,
    activeToolId,
    isDirty,
    isLoading,
    error,
    theme,
  } = useAppStore();

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

  if (!activeToolId) {
    return <WelcomeScreen onAddCustomTool={onAddCustomTool} />;
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center dark:bg-editor bg-white dark:text-gray-400 text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-sm">Loading configuration...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center dark:bg-editor bg-white">
        <div className="text-center max-w-md p-6">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full dark:bg-red-500/10 bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
          </div>
          <p className="dark:text-red-400 text-red-600 text-lg font-medium mb-2">Failed to load config</p>
          <p className="dark:text-gray-400 text-slate-500 text-sm mb-4">{error}</p>
          {currentFilePath && (
            <p className="dark:text-gray-600 text-slate-400 text-xs font-mono dark:bg-gray-800/50 bg-slate-100 px-3 py-2 rounded-lg">
              {currentFilePath}
            </p>
          )}
        </div>
      </div>
    );
  }

  const lineCount = editorContent.split('\n').length;
  const byteSize = new Blob([editorContent]).size;
  const formatInfo = FORMAT_LABELS[currentFormat];

  return (
    <div className="flex-1 flex flex-col dark:bg-editor bg-white" onKeyDown={handleKeyDown}>
      {externalChangeDetected && (
        <div className="flex items-center justify-between px-4 py-2 bg-blue-500/10 dark:bg-blue-500/20 border-b border-blue-500/30">
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <RefreshCw className="w-4 h-4" />
            <span>File changed externally. Reload to see latest changes?</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onReloadFile}
              className="px-3 py-1 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              Reload
            </button>
            <button
              onClick={onDismissExternalChange}
              className="p-1 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between px-4 py-2 border-b dark:border-gray-700/50 border-slate-200 dark:bg-gray-900/30 bg-slate-50/80">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="dark:text-gray-300 text-slate-700 font-medium truncate max-w-[300px]">
              {currentFilePath?.split('/').pop()}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1
                            ${isDirty() 
                              ? 'dark:bg-yellow-500/20 bg-amber-100 dark:text-yellow-400 text-amber-700' 
                              : 'dark:bg-gray-700/50 bg-slate-100 dark:text-gray-400 text-slate-500'}`}>
              {formatInfo.icon}
              {formatInfo.label}
            </span>
          </div>
          {isDirty() && (
            <span className="flex items-center gap-1 text-xs dark:text-yellow-500 text-amber-600">
              <span className="w-1.5 h-1.5 rounded-full dark:bg-yellow-500 bg-amber-500 animate-pulse" />
              Modified
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onFormat}
            className="px-3 py-1.5 text-sm flex items-center gap-1.5 
                       dark:bg-gray-700/50 bg-slate-100 dark:hover:bg-gray-600/50 hover:bg-slate-200 dark:text-gray-300 text-slate-600 rounded-lg 
                       border dark:border-gray-600/50 border-slate-200 transition-colors"
            title="Format code"
          >
            <AlignLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Format</span>
          </button>
          <button
            onClick={onSave}
            disabled={!isDirty()}
            className={`px-3 py-1.5 text-sm flex items-center gap-1.5 rounded-lg transition-all
                       ${isDirty()
                         ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                         : 'dark:bg-gray-700/30 bg-slate-100 dark:text-gray-500 text-slate-400 cursor-not-allowed border dark:border-gray-700/50 border-slate-200'}`}
            title="Save (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </div>

      <div className="flex-1">
        <Editor
          height="100%"
          language={FORMAT_TO_LANGUAGE[currentFormat]}
          value={editorContent}
          onChange={handleEditorChange}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            formatOnPaste: true,
            padding: { top: 12, bottom: 12 },
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            renderLineHighlight: 'gutter',
          }}
        />
      </div>

      <div className="flex items-center justify-between px-4 py-1.5 text-xs dark:text-gray-500 text-slate-400 
                      border-t dark:border-gray-700/50 border-slate-200 dark:bg-gray-900/30 bg-slate-50/80">
        <div className="flex items-center gap-4">
          <span className="font-mono truncate max-w-[400px]" title={currentFilePath || ''}>
            {currentFilePath}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>Lines: {lineCount}</span>
          <span>{formatBytes(byteSize)}</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
