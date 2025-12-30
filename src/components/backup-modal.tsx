import { useState, useEffect, useCallback } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '@/stores/app-store';
import { Modal, Button } from '@/components/ui';
import {
  History,
  RotateCcw,
  Clock,
  FileText,
  ChevronRight,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface BackupInfo {
  path: string;
  name: string;
  modifiedAt: number;
  size: number;
}

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  filePath: string;
  currentContent: string;
  onRestored: () => void;
}

export function BackupModal({
  isOpen,
  onClose,
  filePath,
  currentContent,
  onRestored,
}: BackupModalProps) {
  const { theme } = useAppStore();
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<BackupInfo | null>(null);
  const [backupContent, setBackupContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBackups = useCallback(async () => {
    if (!filePath) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<BackupInfo[]>('list_backups', { path: filePath });
      setBackups(result);
      if (result.length > 0) {
        setSelectedBackup(result[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [filePath]);

  const loadBackupContent = useCallback(async (backup: BackupInfo) => {
    setLoadingContent(true);
    try {
      const content = await invoke<string>('read_backup', { backupPath: backup.path });
      setBackupContent(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingContent(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadBackups();
    } else {
      setBackups([]);
      setSelectedBackup(null);
      setBackupContent('');
      setError(null);
    }
  }, [isOpen, loadBackups]);

  useEffect(() => {
    if (selectedBackup) {
      loadBackupContent(selectedBackup);
    }
  }, [selectedBackup, loadBackupContent]);

  const handleRestore = async () => {
    if (!selectedBackup) return;

    setRestoring(true);
    try {
      await invoke('restore_backup', {
        originalPath: filePath,
        backupPath: selectedBackup.path,
        createBackup: true,
      });
      onRestored();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRestoring(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return formatDate(timestamp);
  };

  const footerContent = (
    <>
      <div className="flex-1">
        {error ? (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm dark:text-slate-400 text-slate-500">
            <AlertTriangle className="w-4 h-4" />
            <span>Restoring will create a backup of the current file first</span>
          </div>
        )}
      </div>
      <Button variant="ghost" onClick={onClose}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleRestore}
        disabled={!selectedBackup || restoring}
        isLoading={restoring}
        leftIcon={!restoring ? <RotateCcw className="w-4 h-4" /> : undefined}
      >
        {restoring ? 'Restoring...' : 'Restore This Backup'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={true}
      size="full"
      className="!max-w-6xl h-[85vh]"
      footer={footerContent}
    >
      <div className="flex flex-col h-full -mx-6 -my-4">
        {/* Custom Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b dark:border-slate-700 border-slate-200">
          <div className="w-10 h-10 rounded-lg dark:bg-blue-500/20 bg-blue-100 flex items-center justify-center">
            <History className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold dark:text-white text-slate-800">
              Backup History
            </h2>
            <p className="text-sm dark:text-slate-400 text-slate-500">
              Compare and restore previous versions
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Backup List Sidebar */}
          <div className="w-72 border-r dark:border-slate-700 border-slate-200 flex flex-col">
            <div className="px-4 py-3 border-b dark:border-slate-700/50 border-slate-100">
              <h3 className="text-sm font-medium dark:text-slate-300 text-slate-600">
                Available Backups
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : backups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <FileText className="w-10 h-10 dark:text-slate-600 text-slate-300 mb-2" />
                  <p className="text-sm dark:text-slate-500 text-slate-400">
                    No backups found
                  </p>
                  <p className="text-xs dark:text-slate-600 text-slate-400 mt-1">
                    Backups are created when you save
                  </p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {backups.map((backup) => (
                    <button
                      key={backup.path}
                      onClick={() => setSelectedBackup(backup)}
                      className={`w-full text-left px-3 py-3 rounded-lg transition-all
                                ${selectedBackup?.path === backup.path
                                  ? 'dark:bg-blue-500/20 bg-blue-50 border dark:border-blue-500/30 border-blue-200'
                                  : 'dark:hover:bg-slate-700/50 hover:bg-slate-50'
                                }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium
                                        ${selectedBackup?.path === backup.path
                                          ? 'dark:text-blue-400 text-blue-600'
                                          : 'dark:text-slate-300 text-slate-700'
                                        }`}>
                          {backup.name}
                        </span>
                        <ChevronRight className={`w-4 h-4 transition-transform
                                                ${selectedBackup?.path === backup.path
                                                  ? 'dark:text-blue-400 text-blue-500'
                                                  : 'dark:text-slate-500 text-slate-400'
                                                }`} />
                      </div>
                      <div className="flex items-center gap-2 text-xs dark:text-slate-500 text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(backup.modifiedAt)}</span>
                        <span>•</span>
                        <span>{formatSize(backup.size)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Diff Viewer */}
          <div className="flex-1 flex flex-col">
            {selectedBackup ? (
              <>
                <div className="flex items-center justify-between px-4 py-2 border-b dark:border-slate-700/50 border-slate-100 dark:bg-slate-900/30 bg-slate-50">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded dark:bg-red-500/20 bg-red-100 dark:text-red-400 text-red-600 text-xs font-medium">
                        Backup
                      </span>
                      <span className="dark:text-slate-400 text-slate-500">
                        {formatDate(selectedBackup.modifiedAt)}
                      </span>
                    </div>
                    <span className="dark:text-slate-600 text-slate-300">→</span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded dark:bg-green-500/20 bg-green-100 dark:text-green-400 text-green-600 text-xs font-medium">
                        Current
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  {loadingContent ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                  ) : (
                    <DiffEditor
                      height="100%"
                      original={backupContent}
                      modified={currentContent}
                      language="yaml"
                      theme={theme === 'dark' ? 'vs-dark' : 'light'}
                      options={{
                        readOnly: true,
                        renderSideBySide: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 13,
                        padding: { top: 12, bottom: 12 },
                      }}
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center dark:text-slate-500 text-slate-400">
                <p className="text-sm">Select a backup to view differences</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
