import { McpConfigPreview } from '@/types';
import { X, FileJson } from 'lucide-react';

interface McpConfigPreviewModalProps {
  isOpen: boolean;
  preview: McpConfigPreview | null;
  onClose: () => void;
  isLoading?: boolean;
}

export function McpConfigPreviewModal({
  isOpen,
  preview,
  onClose,
  isLoading,
}: McpConfigPreviewModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={handleBackdropClick}
    >
      <div className="glass-panel rounded-xl shadow-2xl w-full max-w-5xl animate-in fade-in zoom-in-95 duration-200 h-[85vh] flex flex-col">
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-white/5">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold dark:text-slate-200 text-slate-800">
              Config Preview - {preview?.toolName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 p-6 flex flex-col">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-slate-500 dark:text-slate-400">Loading preview...</div>
            </div>
          ) : preview ? (
            <>
              <div className="flex-shrink-0 text-xs text-slate-500 dark:text-slate-400 mb-3 font-mono">
                {preview.configPath}
              </div>
              
              <div className="flex-1 min-h-0 grid grid-cols-2 gap-4">
                {/* Current content */}
                <div className="flex flex-col min-h-0">
                  <div className="flex-shrink-0 flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      Current
                    </span>
                  </div>
                  <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50">
                    <pre className="p-4 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre">
                      {preview.currentContent}
                    </pre>
                  </div>
                </div>

                {/* Preview content */}
                <div className="flex flex-col min-h-0">
                  <div className="flex-shrink-0 flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      After Sync
                    </span>
                  </div>
                  <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-900/10">
                    <pre className="p-4 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre">
                      {preview.previewContent}
                    </pre>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No preview available
            </div>
          )}
        </div>

        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200
                         rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
