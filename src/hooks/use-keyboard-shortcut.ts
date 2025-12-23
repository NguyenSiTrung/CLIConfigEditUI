import { useEffect, useCallback } from 'react';

type KeyboardShortcutCallback = (event: KeyboardEvent) => void;

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: KeyboardShortcutCallback;
  enabled?: boolean;
}

function normalizeKey(key: string): string {
  return key.toLowerCase();
}

export function useKeyboardShortcut(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;

        const keyMatch = normalizeKey(event.key) === normalizeKey(shortcut.key);
        const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : true;
        const metaMatch = shortcut.meta ? event.metaKey : true;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey || shortcut.shift === undefined;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (shortcut.ctrl && !event.ctrlKey && !event.metaKey) continue;
        if (shortcut.meta && !event.metaKey) continue;
        if (shortcut.shift && !event.shiftKey) continue;
        if (shortcut.alt && !event.altKey) continue;

        if (keyMatch && ctrlMatch && metaMatch && (shortcut.shift === undefined || shiftMatch) && altMatch) {
          event.preventDefault();
          shortcut.callback(event);
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export function formatShortcut(shortcut: { ctrl?: boolean; shift?: boolean; alt?: boolean; key: string }): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const parts: string[] = [];

  if (shortcut.ctrl) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }
  parts.push(shortcut.key.toUpperCase());

  return isMac ? parts.join('') : parts.join('+');
}
