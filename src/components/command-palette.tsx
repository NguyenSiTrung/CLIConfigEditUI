import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Modal } from './ui';
import {
  Search,
  Settings,
  Sun,
  Moon,
  FileCode,
  Server,
  Plus,
  Palette,
} from 'lucide-react';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onAddCustomTool: () => void;
  onSwitchToMcp: () => void;
  onSwitchToEditor: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenSettings,
  onAddCustomTool,
  onSwitchToMcp,
  onSwitchToEditor,
}: CommandPaletteProps) {
  const { toggleTheme, theme, getAllTools, setActiveToolId } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allTools = getAllTools();

  const commands = useMemo<Command[]>(() => {
    const baseCommands: Command[] = [
      {
        id: 'settings',
        label: 'Open Settings',
        description: 'Configure editor, backups, and behavior',
        icon: <Settings className="w-4 h-4" />,
        action: () => {
          onOpenSettings();
          onClose();
        },
        keywords: ['preferences', 'config', 'options'],
      },
      {
        id: 'toggle-theme',
        label: theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme',
        description: 'Toggle between light and dark mode',
        icon: theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
        action: () => {
          toggleTheme();
          onClose();
        },
        keywords: ['theme', 'dark', 'light', 'mode', 'appearance'],
      },
      {
        id: 'add-tool',
        label: 'Add Custom Tool',
        description: 'Create a new custom CLI tool configuration',
        icon: <Plus className="w-4 h-4" />,
        action: () => {
          onAddCustomTool();
          onClose();
        },
        keywords: ['new', 'create', 'tool'],
      },
      {
        id: 'switch-mcp',
        label: 'Open MCP Settings',
        description: 'Manage Model Context Protocol servers',
        icon: <Server className="w-4 h-4" />,
        action: () => {
          onSwitchToMcp();
          onClose();
        },
        keywords: ['mcp', 'server', 'model', 'context', 'protocol'],
      },
      {
        id: 'switch-editor',
        label: 'Open Config Editor',
        description: 'Edit CLI configuration files',
        icon: <FileCode className="w-4 h-4" />,
        action: () => {
          onSwitchToEditor();
          onClose();
        },
        keywords: ['editor', 'config', 'edit'],
      },
    ];

    const toolCommands: Command[] = allTools.map((tool) => ({
      id: `tool-${tool.id}`,
      label: `Switch to ${tool.name}`,
      description: tool.description,
      icon: <Palette className="w-4 h-4" />,
      action: () => {
        setActiveToolId(tool.id);
        onClose();
      },
      keywords: [tool.name.toLowerCase(), 'tool', 'switch'],
    }));

    return [...baseCommands, ...toolCommands];
  }, [theme, toggleTheme, onOpenSettings, onAddCustomTool, onSwitchToMcp, onSwitchToEditor, onClose, allTools, setActiveToolId]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    
    const lowerQuery = query.toLowerCase();
    return commands.filter((cmd) => {
      const matchLabel = cmd.label.toLowerCase().includes(lowerQuery);
      const matchDesc = cmd.description?.toLowerCase().includes(lowerQuery);
      const matchKeywords = cmd.keywords?.some((kw) => kw.includes(lowerQuery));
      return matchLabel || matchDesc || matchKeywords;
    });
  }, [commands, query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filteredCommands, selectedIndex, onClose]
  );

  useEffect(() => {
    const selectedElement = listRef.current?.children[selectedIndex] as HTMLElement;
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="flex flex-col max-h-[70vh]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex px-2 py-1 text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 rounded">
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="overflow-y-auto py-2 max-h-[400px]">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
              No commands found for "{query}"
            </div>
          ) : (
            filteredCommands.map((cmd, index) => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors
                  ${
                    index === selectedIndex
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
              >
                <span
                  className={`flex-shrink-0 ${
                    index === selectedIndex
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {cmd.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{cmd.label}</div>
                  {cmd.description && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {cmd.description}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">↵</kbd>
              Select
            </span>
          </div>
          <span>{filteredCommands.length} commands</span>
        </div>
      </div>
    </Modal>
  );
}
