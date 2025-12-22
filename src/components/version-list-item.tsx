import { useState } from 'react';
import { useVersionsStore } from '@/stores/versions-store';
import { VersionMetadata } from '@/types';
import { ask } from '@tauri-apps/plugin-dialog';
import { toast } from './toast';
import {
  Clock,
  Star,
  MoreVertical,
  Trash2,
  Copy,
  Pencil,
  Check,
  X,
  FileEdit,
} from 'lucide-react';

interface VersionListItemProps {
  version: VersionMetadata;
  isSelected: boolean;
  onApplyVersion: (content: string) => void;
  onEditVersion: (version: VersionMetadata) => void;
}

export function VersionListItem({ version, isSelected, onApplyVersion, onEditVersion }: VersionListItemProps) {
  const { 
    toggleVersionSelection, 
    deleteVersion, 
    updateVersion, 
    duplicateVersion, 
    setDefault,
    loadVersion,
    currentConfigId 
  } = useVersionsStore();
  
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(version.name);
  const [isLoading, setIsLoading] = useState(false);

  const handleApply = async () => {
    if (!currentConfigId) return;
    
    const confirmed = await ask(
      'This will replace the current configuration. Create a backup before proceeding?',
      { title: 'Apply Version', kind: 'warning' }
    );
    
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const fullVersion = await loadVersion(currentConfigId, version.id);
      onApplyVersion(fullVersion.content);
      toast.success(`Applied version "${version.name}"`);
    } catch (err) {
      toast.error(`Failed to apply: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentConfigId) return;
    
    const confirmed = await ask(
      `Delete version "${version.name}"? This cannot be undone.`,
      { title: 'Delete Version', kind: 'warning' }
    );
    
    if (!confirmed) return;

    try {
      await deleteVersion(currentConfigId, version.id);
      toast.success('Version deleted');
    } catch (err) {
      toast.error(`Failed to delete: ${err}`);
    }
    setShowMenu(false);
  };

  const handleDuplicate = async () => {
    if (!currentConfigId) return;
    
    try {
      await duplicateVersion(currentConfigId, version.id, `${version.name} (copy)`);
      toast.success('Version duplicated');
    } catch (err) {
      toast.error(`Failed to duplicate: ${err}`);
    }
    setShowMenu(false);
  };

  const handleToggleDefault = async () => {
    if (!currentConfigId) return;
    
    try {
      await setDefault(currentConfigId, version.id);
      toast.success(`"${version.name}" set as default`);
    } catch (err) {
      toast.error(`Failed to set default: ${err}`);
    }
    setShowMenu(false);
  };

  const handleRename = async () => {
    if (!currentConfigId || !newName.trim()) return;
    
    try {
      await updateVersion(currentConfigId, version.id, { name: newName.trim() });
      toast.success('Version renamed');
      setIsRenaming(false);
    } catch (err) {
      toast.error(`Failed to rename: ${err}`);
    }
  };

  const handleCancelRename = () => {
    setNewName(version.name);
    setIsRenaming(false);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`relative group p-3 rounded-lg border transition-all cursor-pointer
        ${isSelected 
          ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/30' 
          : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
        }`}
      onClick={() => toggleVersionSelection(version.id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 px-2 py-1 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') handleCancelRename();
                }}
              />
              <button onClick={handleRename} className="p-1 text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={handleCancelRename} className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                {version.name}
              </span>
              {version.isDefault && (
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
              )}
            </div>
          )}
          
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <Clock className="w-3 h-3" />
              {formatDate(version.timestamp)}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              version.source === 'manual' 
                ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}>
              {version.source}
            </span>
          </div>
          
          {version.description && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              {version.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEditVersion(version)}
            title="Edit this version's content"
            className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded transition-colors flex items-center gap-1"
          >
            <FileEdit className="w-3 h-3" />
            Edit
          </button>
          <button
            onClick={handleApply}
            disabled={isLoading}
            title="Replace current editor content with this version"
            className="px-2.5 py-1 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors disabled:opacity-50"
          >
            {isLoading ? '...' : 'Apply'}
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              title="More actions"
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 py-1">
                  <button
                    onClick={() => { setIsRenaming(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Rename
                  </button>
                  <button
                    onClick={handleDuplicate}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Duplicate
                  </button>
                  <button
                    onClick={handleToggleDefault}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <Star className="w-3.5 h-3.5" />
                    {version.isDefault ? 'Unset Default' : 'Set as Default'}
                  </button>
                  <hr className="my-1 border-slate-200 dark:border-slate-700" />
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
