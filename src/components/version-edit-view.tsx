import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useAppStore } from '@/stores/app-store';
import { useVersionsStore } from '@/stores/versions-store';
import { VersionMetadata, ConfigVersion } from '@/types';
import { invoke } from '@tauri-apps/api/core';
import { toast } from './toast';
import { X, ArrowLeft, Loader2, Save, CheckCircle2 } from 'lucide-react';

interface VersionEditViewProps {
  version: VersionMetadata;
  configId: string;
  onClose: () => void;
  onSaved?: () => void;
}

export function VersionEditView({ 
  version, 
  configId,
  onClose,
  onSaved,
}: VersionEditViewProps) {
  const { theme, currentFormat, editorSettings } = useAppStore();
  const { updateVersionContent } = useVersionsStore();
  const [content, setContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      if (!configId) {
        setError('No config selected');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const fullVersion = await invoke<ConfigVersion>('load_version', { 
          configId, 
          versionId: version.id 
        });
        setContent(fullVersion.content);
        setOriginalContent(fullVersion.content);
        setIsLoading(false);
      } catch (err) {
        setError(String(err));
        setIsLoading(false);
      }
    };

    loadContent();
  }, [version.id, configId]);

  const isDirty = content !== originalContent;

  const handleSave = async () => {
    if (!isDirty || isSaving) return;

    setIsSaving(true);
    try {
      await updateVersionContent(configId, version.id, content);
      setOriginalContent(content);
      toast.success(`Version "${version.name}" saved`);
      onSaved?.();
    } catch (err) {
      toast.error(`Failed to save: ${err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  const getLanguage = () => {
    switch (currentFormat) {
      case 'json': return 'json';
      case 'yaml': return 'yaml';
      case 'toml': return 'ini';
      case 'ini': return 'ini';
      case 'md': return 'markdown';
      default: return 'plaintext';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#020617]" onKeyDown={handleKeyDown}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Editing:</span>
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {version.name}
            </span>
            {isDirty && (
              <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full">
                Unsaved
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className={`px-4 py-1.5 text-xs font-medium flex items-center gap-2 rounded-lg transition-all shadow-sm
              ${isDirty
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isDirty ? (
              <Save className="w-3.5 h-3.5" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-400">
            {error}
          </div>
        ) : (
          <Editor
            height="100%"
            language={getLanguage()}
            value={content}
            onChange={(value) => setContent(value || '')}
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
        )}
      </div>
    </div>
  );
}
