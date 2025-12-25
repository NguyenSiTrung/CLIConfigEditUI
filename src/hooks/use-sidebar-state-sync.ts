import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '@/stores/app-store';

interface SidebarState {
  expandedTools: string[];
}

export function useSidebarStateSync() {
  const expandedTools = useAppStore((state) => state.expandedTools);
  const isInitialized = useRef(false);

  useEffect(() => {
    async function loadTauriBackup() {
      try {
        const localStorageData = localStorage.getItem('cli-config-editor');
        const parsedLocal = localStorageData ? JSON.parse(localStorageData) : null;
        const hasLocalExpandedTools = parsedLocal?.state?.expandedTools?.length > 0;

        if (!hasLocalExpandedTools) {
          const state = await invoke<SidebarState>('load_sidebar_state');
          if (state.expandedTools.length > 0) {
            const currentState = useAppStore.getState();
            useAppStore.setState({
              expandedTools: new Set([...currentState.expandedTools, ...state.expandedTools]),
            });
          }
        }
      } catch {
        // Silently fail - Tauri might not be available in dev mode
      }
      isInitialized.current = true;
    }

    loadTauriBackup();
  }, []);

  useEffect(() => {
    if (!isInitialized.current) return;

    const syncToTauri = async () => {
      try {
        await invoke('save_sidebar_state', {
          expandedTools: Array.from(expandedTools),
        });
      } catch {
        // Silently fail - Tauri might not be available
      }
    };

    const debounceTimer = setTimeout(syncToTauri, 500);
    return () => clearTimeout(debounceTimer);
  }, [expandedTools]);
}
