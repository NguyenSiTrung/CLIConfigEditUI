import { useMemo } from 'react';
import { Modal } from './ui';
import { Navigation, Edit3, Eye, Settings, Command } from 'lucide-react';
import { formatShortcut } from '@/hooks/use-keyboard-shortcut';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: { ctrl?: boolean; shift?: boolean; alt?: boolean; key: string };
  description: string;
}

interface ShortcutCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcuts: Shortcut[];
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const categories = useMemo<ShortcutCategory[]>(() => [
    {
      id: 'navigation',
      label: 'Navigation',
      icon: <Navigation className="w-4 h-4" />,
      shortcuts: [
        { keys: { ctrl: true, key: 'k' }, description: 'Open command palette' },
        { keys: { ctrl: true, key: 'p' }, description: 'Quick open file' },
        { keys: { ctrl: true, key: ',' }, description: 'Open settings' },
        { keys: { ctrl: true, key: 'b' }, description: 'Toggle sidebar' },
      ],
    },
    {
      id: 'editor',
      label: 'Editor',
      icon: <Edit3 className="w-4 h-4" />,
      shortcuts: [
        { keys: { ctrl: true, key: 's' }, description: 'Save file' },
        { keys: { ctrl: true, shift: true, key: 'f' }, description: 'Format document' },
        { keys: { ctrl: true, key: 'f' }, description: 'Find in file' },
        { keys: { ctrl: true, key: 'z' }, description: 'Undo' },
        { keys: { ctrl: true, shift: true, key: 'z' }, description: 'Redo' },
      ],
    },
    {
      id: 'views',
      label: 'Views',
      icon: <Eye className="w-4 h-4" />,
      shortcuts: [
        { keys: { ctrl: true, key: '1' }, description: 'Switch to Config Editor' },
        { keys: { ctrl: true, key: '2' }, description: 'Switch to MCP Settings' },
      ],
    },
    {
      id: 'general',
      label: 'General',
      icon: <Settings className="w-4 h-4" />,
      shortcuts: [
        { keys: { key: 'Escape' }, description: 'Close modal / Cancel action' },
      ],
    },
  ], []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      size="md"
    >
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category.id}>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 dark:text-slate-500">
                {category.icon}
              </span>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {category.label}
              </h3>
            </div>
            <div className="space-y-2">
              {category.shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 rounded-lg
                             bg-slate-50 dark:bg-slate-800/50
                             border border-slate-100 dark:border-slate-700/50"
                >
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    {shortcut.description}
                  </span>
                  <kbd className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium
                                  text-slate-600 dark:text-slate-300
                                  bg-white dark:bg-slate-700
                                  border border-slate-200 dark:border-slate-600
                                  rounded shadow-sm">
                    {formatShortcut(shortcut.keys)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Command className="w-3.5 h-3.5" />
            <span>On macOS, Ctrl is displayed as ⌘ (Command)</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
