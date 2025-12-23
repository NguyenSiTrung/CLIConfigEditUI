import { McpSyncPreview, McpServerConflict } from '@/types';
import { Modal, Button } from '@/components/ui';
import { Plus, AlertTriangle, Check, Settings, FileJson } from 'lucide-react';

interface McpSyncPreviewModalProps {
  isOpen: boolean;
  previews: McpSyncPreview[];
  onConfirm: () => void;
  onClose: () => void;
  onResolveConflicts?: (conflicts: McpServerConflict[], toolName: string) => void;
  onViewFullConfig?: (toolId: string) => void;
  isLoading?: boolean;
}

export function McpSyncPreviewModal({
  isOpen,
  previews,
  onConfirm,
  onClose,
  onResolveConflicts,
  onViewFullConfig,
  isLoading,
}: McpSyncPreviewModalProps) {
  const totalAdded = previews.reduce((sum, p) => sum + p.mergeResult.added.length, 0);
  const totalConflicts = previews.reduce((sum, p) => sum + p.mergeResult.conflicts.length, 0);
  const hasChanges = previews.some((p) => p.hasChanges);

  const handleResolveConflicts = (preview: McpSyncPreview) => {
    if (onResolveConflicts && preview.mergeResult.conflicts.length > 0) {
      onResolveConflicts(preview.mergeResult.conflicts, preview.toolName);
    }
  };

  const footerContent = (
    <div className="flex items-center justify-between w-full">
      <div className="text-sm text-slate-500 dark:text-slate-400">
        {hasChanges ? (
          <>
            {totalAdded > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400">+{totalAdded} </span>
            )}
            {totalConflicts > 0 && (
              <span className="text-amber-600 dark:text-amber-400">
                ⚠ {totalConflicts} conflicts (will use source)
              </span>
            )}
          </>
        ) : (
          'No changes to apply'
        )}
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        {hasChanges && (
          <Button
            variant="primary"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {isLoading ? 'Syncing...' : 'Apply Changes'}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sync Preview"
      size="full"
      className="max-w-2xl"
      footer={footerContent}
    >
      {!hasChanges && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <Check className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
          <p className="text-sm font-medium">All tools are in sync!</p>
          <p className="text-xs mt-1">No changes needed</p>
        </div>
      )}

      <div className="space-y-4">
        {previews.filter((p) => p.hasChanges).map((preview) => (
          <div
            key={preview.toolId}
            className="rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden"
          >
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
              <h3 className="font-medium text-sm text-slate-800 dark:text-slate-200">
                {preview.toolName}
              </h3>
              {onViewFullConfig && (
                <button
                  onClick={() => onViewFullConfig(preview.toolId)}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 
                             hover:bg-slate-100 dark:hover:bg-white/5 rounded transition-colors"
                  title="View full config JSON"
                >
                  <FileJson className="w-3 h-3" />
                  View Config
                </button>
              )}
            </div>
            <div className="p-4 space-y-3">
              {preview.mergeResult.added.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2">
                    <Plus className="w-3 h-3" />
                    Adding {preview.mergeResult.added.length} server
                    {preview.mergeResult.added.length !== 1 ? 's' : ''}
                  </div>
                  <div className="space-y-1">
                    {preview.mergeResult.added.map((server) => (
                      <div
                        key={server.name}
                        className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-emerald-50 dark:bg-emerald-500/10 rounded px-2 py-1"
                      >
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {server.name}
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className="font-mono truncate">{server.command}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {preview.mergeResult.conflicts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-3 h-3" />
                      {preview.mergeResult.conflicts.length} conflict
                      {preview.mergeResult.conflicts.length !== 1 ? 's' : ''}
                    </div>
                    {onResolveConflicts && (
                      <button
                        onClick={() => handleResolveConflicts(preview)}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 
                                   hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded transition-colors"
                      >
                        <Settings className="w-3 h-3" />
                        Resolve
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {preview.mergeResult.conflicts.map((conflict) => (
                      <div
                        key={conflict.serverName}
                        className="text-xs text-slate-600 dark:text-slate-400 bg-amber-50 dark:bg-amber-500/10 rounded px-2 py-1"
                      >
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {conflict.serverName}
                        </span>
                        <span className="text-slate-400 ml-2">- config differs (will use source)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {preview.mergeResult.kept.length > 0 && (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {preview.mergeResult.kept.length} server
                  {preview.mergeResult.kept.length !== 1 ? 's' : ''} unchanged
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
