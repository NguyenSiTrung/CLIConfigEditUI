import { McpConfigPreview } from '@/types';
import { Modal, Button } from '@/components/ui';
import { FileJson } from 'lucide-react';

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
  const headerContent = (
    <div className="flex items-center gap-2">
      <FileJson className="w-5 h-5 text-indigo-500" />
      <span>Config Preview - {preview?.toolName}</span>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={headerContent as unknown as string}
      size="full"
      className="h-[85vh]"
      footer={<Button variant="ghost" onClick={onClose}>Close</Button>}
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500 dark:text-slate-400">Loading preview...</div>
        </div>
      ) : preview ? (
        <div className="flex flex-col h-full">
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
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          No preview available
        </div>
      )}
    </Modal>
  );
}
