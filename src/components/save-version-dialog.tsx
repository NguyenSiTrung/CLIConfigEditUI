import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useVersionsStore } from '@/stores/versions-store';
import { useAppStore } from '@/stores/app-store';
import { toast } from './toast';
import { X, Save, Loader2, FileCode, Edit3 } from 'lucide-react';

type ContentSource = 'editor' | 'custom';

interface SaveVersionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SaveVersionDialog({ isOpen, onClose }: SaveVersionDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [contentSource, setContentSource] = useState<ContentSource>('editor');
  const [customContent, setCustomContent] = useState('');
  
  const { saveVersion, currentConfigId } = useVersionsStore();
  const { editorContent, currentFormat, theme } = useAppStore();

  const handleSave = async () => {
    if (!name.trim() || !currentConfigId) return;

    const contentToSave = contentSource === 'editor' ? editorContent : customContent;
    
    if (!contentToSave.trim()) {
      toast.error('Content cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      await saveVersion(currentConfigId, name.trim(), contentToSave, description.trim() || undefined);
      toast.success(`Version "${name}" saved`);
      handleClose();
    } catch (err) {
      toast.error(`Failed to save version: ${err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setContentSource('editor');
    setCustomContent('');
    onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 ${contentSource === 'custom' ? 'max-w-3xl' : 'max-w-md'} transition-all duration-200`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Save Version
          </h2>
          <button
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Version Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Work Setup, Minimal Config"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 placeholder:text-slate-400"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this version for?"
              rows={2}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 placeholder:text-slate-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Content Source
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setContentSource('editor')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg border transition-all
                  ${contentSource === 'editor'
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
              >
                <FileCode className="w-4 h-4" />
                Current Editor
              </button>
              <button
                onClick={() => setContentSource('custom')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg border transition-all
                  ${contentSource === 'custom'
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
              >
                <Edit3 className="w-4 h-4" />
                Custom Content
              </button>
            </div>
          </div>

          {contentSource === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Content
              </label>
              <div className="h-64 border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
                <Editor
                  height="100%"
                  language={getLanguage()}
                  value={customContent}
                  onChange={(value) => setCustomContent(value || '')}
                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 12,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 8, bottom: 8 },
                  }}
                />
              </div>
            </div>
          )}

          {contentSource === 'editor' && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This will save the current content from the editor ({editorContent.split('\n').length} lines, {new Blob([editorContent]).size} bytes)
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
            className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Version
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
