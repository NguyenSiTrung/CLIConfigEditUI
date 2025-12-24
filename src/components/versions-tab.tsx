import { useState } from 'react';
import { useVersionsStore } from '@/stores/versions-store';
import { useAppStore } from '@/stores/app-store';
import { VersionMetadata } from '@/types';
import { SaveVersionDialog } from './save-version-dialog';
import { VersionDiffView } from './version-diff-view';
import { VersionEditView } from './version-edit-view';
import {
  Plus,
  Loader2,
  AlertCircle,
  Layers,
  GitCompare,
} from 'lucide-react';
import { VersionListItem } from './version-list-item';

interface VersionsTabProps {
  onApplyVersion: (content: string) => void;
}

export function VersionsTab({ onApplyVersion }: VersionsTabProps) {
  const { versions, isLoading, error, selectedVersionIds, clearSelection, currentConfigId } = useVersionsStore();
  const { activeConfigFileId, editorContent } = useAppStore();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDiffView, setShowDiffView] = useState(false);
  const [diffVersions, setDiffVersions] = useState<{ left: VersionMetadata; right: VersionMetadata | 'current' } | null>(null);
  const [editingVersion, setEditingVersion] = useState<VersionMetadata | null>(null);

  const handleCompare = () => {
    if (selectedVersionIds.length === 2) {
      const left = versions.find(v => v.id === selectedVersionIds[0]);
      const right = versions.find(v => v.id === selectedVersionIds[1]);
      if (left && right) {
        setDiffVersions({ left, right });
        setShowDiffView(true);
      }
    } else if (selectedVersionIds.length === 1) {
      const left = versions.find(v => v.id === selectedVersionIds[0]);
      if (left) {
        setDiffVersions({ left, right: 'current' });
        setShowDiffView(true);
      }
    }
  };

  const handleCloseDiff = () => {
    setShowDiffView(false);
    setDiffVersions(null);
    clearSelection();
  };

  const handleEditVersion = (version: VersionMetadata) => {
    setEditingVersion(version);
  };

  const handleCloseEdit = () => {
    setEditingVersion(null);
  };

  if (!activeConfigFileId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-slate-400 dark:text-slate-500">
          <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Select a config file to manage versions</p>
        </div>
      </div>
    );
  }

  if (isLoading && versions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error && versions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (showDiffView && diffVersions && currentConfigId) {
    return (
      <VersionDiffView
        leftVersion={diffVersions.left}
        rightVersion={diffVersions.right}
        currentContent={editorContent}
        configId={currentConfigId}
        onClose={handleCloseDiff}
      />
    );
  }

  if (editingVersion && currentConfigId) {
    return (
      <VersionEditView
        version={editingVersion}
        configId={currentConfigId}
        onClose={handleCloseEdit}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#020617]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Versions ({versions.length})
            </span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 ml-6">Compare app snapshots and restore previous versions</span>
        </div>
        <div className="flex items-center gap-2">
          {selectedVersionIds.length > 0 && (
            <button
              onClick={handleCompare}
              title={selectedVersionIds.length === 1 ? "Compare selected version with current editor content" : "Compare two selected versions side by side"}
              className="px-3 py-1.5 text-xs font-medium flex items-center gap-1.5
                         bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20
                         text-indigo-600 dark:text-indigo-400 rounded-lg transition-all"
            >
              <GitCompare className="w-3.5 h-3.5" />
              Compare {selectedVersionIds.length === 1 ? 'with Current' : `(${selectedVersionIds.length})`}
            </button>
          )}
          <button
            onClick={() => setShowSaveDialog(true)}
            title="Save current configuration as a named version"
            className="px-3 py-1.5 text-xs font-medium flex items-center gap-1.5
                       bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg
                       shadow-sm shadow-indigo-500/25 transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" />
            Save Version
          </button>
        </div>
      </div>

      {/* Version List */}
      <div className="flex-1 overflow-y-auto">
        {versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Layers className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
              No versions saved
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[200px]">
              Save the current configuration as a version to create backups or manage different setups.
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {versions.map((version) => (
              <VersionListItem
                key={version.id}
                version={version}
                isSelected={selectedVersionIds.includes(version.id)}
                onApplyVersion={onApplyVersion}
                onEditVersion={handleEditVersion}
              />
            ))}
          </div>
        )}
      </div>

      <SaveVersionDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
      />
    </div>
  );
}
