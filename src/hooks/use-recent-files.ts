import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'cli-config-editor-recent-files';
const MAX_RECENT_FILES = 10;

export interface RecentFile {
  toolId: string;
  toolName: string;
  configId: string;
  configLabel: string;
  path: string;
  timestamp: number;
}

function loadRecentFiles(): RecentFile[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

function saveRecentFiles(files: RecentFile[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}

export function useRecentFiles() {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>(loadRecentFiles);

  useEffect(() => {
    saveRecentFiles(recentFiles);
  }, [recentFiles]);

  const addRecentFile = useCallback((file: Omit<RecentFile, 'timestamp'>) => {
    setRecentFiles((prev) => {
      // Remove existing entry for same config
      const filtered = prev.filter(
        (f) => !(f.toolId === file.toolId && f.configId === file.configId)
      );

      // Add new entry at the beginning
      const newEntry: RecentFile = {
        ...file,
        timestamp: Date.now(),
      };

      // Keep only the most recent files
      return [newEntry, ...filtered].slice(0, MAX_RECENT_FILES);
    });
  }, []);

  const clearRecentFiles = useCallback(() => {
    setRecentFiles([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const removeRecentFile = useCallback((toolId: string, configId: string) => {
    setRecentFiles((prev) =>
      prev.filter((f) => !(f.toolId === toolId && f.configId === configId))
    );
  }, []);

  return {
    recentFiles,
    addRecentFile,
    clearRecentFiles,
    removeRecentFile,
  };
}
