import { useEffect, useRef, useCallback } from 'react';
import { watch, WatchEvent } from '@tauri-apps/plugin-fs';

interface UseFileWatcherOptions {
  onExternalChange: () => void;
  debounceMs?: number;
}

export function useFileWatcher(
  filePath: string | null,
  { onExternalChange, debounceMs = 500 }: UseFileWatcherOptions
) {
  const unwatchRef = useRef<(() => void) | null>(null);
  const lastWriteTimeRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markAsInternalWrite = useCallback(() => {
    lastWriteTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!filePath) {
      if (unwatchRef.current) {
        unwatchRef.current();
        unwatchRef.current = null;
      }
      return;
    }

    const setupWatcher = async () => {
      try {
        if (unwatchRef.current) {
          unwatchRef.current();
        }

        const unwatch = await watch(filePath, (event: WatchEvent) => {
          const isModify =
            typeof event.type === 'object' && 'modify' in event.type;

          if (!isModify) return;

          const timeSinceWrite = Date.now() - lastWriteTimeRef.current;
          if (timeSinceWrite < 1000) {
            return;
          }

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          timeoutRef.current = setTimeout(() => {
            onExternalChange();
          }, debounceMs);
        });

        unwatchRef.current = unwatch;
      } catch (error) {
        console.error('Failed to setup file watcher:', error);
      }
    };

    setupWatcher();

    return () => {
      if (unwatchRef.current) {
        unwatchRef.current();
        unwatchRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [filePath, onExternalChange, debounceMs]);

  return { markAsInternalWrite };
}
