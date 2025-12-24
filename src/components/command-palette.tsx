import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Modal } from './ui';
import { RecentFile } from '@/hooks';
import { ConfigFile } from '@/types';
import {
  Search,
  Settings,
  Sun,
  Moon,
  FileCode,
  Server,
  Plus,
  Palette,
  Keyboard,
  Clock,
  File,
  Trash2,
} from 'lucide-react';
import { formatShortcut } from '@/hooks/use-keyboard-shortcut';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
  category?: 'recent' | 'navigation' | 'tools' | 'settings';
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onAddCustomTool: () => void;
  onSwitchToMcp: () => void;
  onSwitchToEditor: () => void;
  onOpenKeyboardShortcuts: () => void;
  onFindInFile?: () => void;
  isQuickOpenMode?: boolean;
  recentFiles?: RecentFile[];
  onFileSelect?: (toolId: string, configFile: ConfigFile) => void;
  onClearRecentFiles?: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenSettings,
  onAddCustomTool,
  onSwitchToMcp,
  onSwitchToEditor,
  onOpenKeyboardShortcuts,
  onFindInFile,
  isQuickOpenMode = false,
  recentFiles = [],
  onFileSelect,
  onClearRecentFiles,
}: CommandPaletteProps) {
  const { toggleTheme, theme, getAllTools, getToolConfigFiles } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allTools = getAllTools();

  // Build commands list based on mode
  const commands = useMemo<Command[]>(() => {
    if (isQuickOpenMode) {
      // Quick Open mode: show recent files and all config files
      const items: Command[] = [];

      // Add recent files first (limit to 5)
      recentFiles.slice(0, 5).forEach((file) => {
        items.push({
          id: `recent-${file.toolId}-${file.configId}`,
          label: file.configLabel,
          description: file.path,
          icon: <Clock className="w-4 h-4" />,
          action: () => {
            if (onFileSelect) {
              const configFile: ConfigFile = {
                id: file.configId,
                label: file.configLabel,
                path: file.path,
                format: 'json', // Will be corrected when loaded
              };
              onFileSelect(file.toolId, configFile);
            }
            onClose();
          },
          keywords: [file.toolName.toLowerCase(), file.path.toLowerCase()],
          category: 'recent',
        });
      });

      // Add all config files from all tools
      allTools.forEach((tool) => {
        const configFiles = getToolConfigFiles(tool.id);
        configFiles.forEach((configFile) => {
          // Skip if already in recent files (to avoid duplicates at top)
          const isRecent = recentFiles.some(
            (f) => f.toolId === tool.id && f.configId === configFile.id
          );
          
          items.push({
            id: `config-${tool.id}-${configFile.id}`,
            label: `${tool.name} / ${configFile.label}`,
            description: configFile.path,
            icon: <File className="w-4 h-4" />,
            action: () => {
              if (onFileSelect) {
                onFileSelect(tool.id, configFile);
              }
              onClose();
            },
            keywords: [tool.name.toLowerCase(), configFile.label.toLowerCase(), configFile.path.toLowerCase()],
            category: isRecent ? 'recent' : 'navigation',
          });
        });
      });

      // Add clear recent files action if there are recent files
      if (recentFiles.length > 0 && onClearRecentFiles) {
        items.push({
          id: 'clear-recent',
          label: 'Clear Recent Files',
          description: 'Remove all files from recent list',
          icon: <Trash2 className="w-4 h-4" />,
          action: () => {
            onClearRecentFiles();
            onClose();
          },
          keywords: ['clear', 'remove', 'delete', 'recent'],
          category: 'settings',
        });
      }

      return items;
    }

    // Regular command palette mode
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
        category: 'settings',
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
        category: 'settings',
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
        category: 'tools',
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
        category: 'navigation',
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
        category: 'navigation',
      },
      {
        id: 'keyboard-shortcuts',
        label: 'View Keyboard Shortcuts',
        description: 'Show all available keyboard shortcuts',
        icon: <Keyboard className="w-4 h-4" />,
        action: () => {
          onOpenKeyboardShortcuts();
          onClose();
        },
        keywords: ['keyboard', 'shortcuts', 'keys', 'hotkeys', 'bindings'],
        category: 'settings',
      },
      {
        id: 'find-in-file',
        label: 'Find in File',
        description: 'Search within the current file (Ctrl+F)',
        icon: <Search className="w-4 h-4" />,
        action: () => {
          onClose();
          onFindInFile?.();
        },
        keywords: ['search', 'find', 'ctrl+f', 'text'],
        category: 'navigation',
      },
    ];

    // Add recent files section (limit to 5 in regular mode)
    const recentCommands: Command[] = recentFiles.slice(0, 5).map((file) => ({
      id: `recent-${file.toolId}-${file.configId}`,
      label: `${file.toolName} / ${file.configLabel}`,
      description: file.path,
      icon: <Clock className="w-4 h-4" />,
      action: () => {
        if (onFileSelect) {
          const configFile: ConfigFile = {
            id: file.configId,
            label: file.configLabel,
            path: file.path,
            format: 'json',
          };
          onFileSelect(file.toolId, configFile);
        }
        onClose();
      },
      keywords: [file.toolName.toLowerCase(), file.configLabel.toLowerCase(), 'recent'],
      category: 'recent' as const,
    }));

    const toolCommands: Command[] = allTools.map((tool) => ({
      id: `tool-${tool.id}`,
      label: `Switch to ${tool.name}`,
      description: tool.description,
      icon: <Palette className="w-4 h-4" />,
      action: () => {
        // Just expand the tool in sidebar
        onClose();
      },
      keywords: [tool.name.toLowerCase(), 'tool', 'switch'],
      category: 'tools' as const,
    }));

    return [...recentCommands, ...baseCommands, ...toolCommands];
  }, [
    isQuickOpenMode,
    theme,
    toggleTheme,
    onOpenSettings,
    onAddCustomTool,
    onSwitchToMcp,
    onSwitchToEditor,
    onOpenKeyboardShortcuts,
    onFindInFile,
    onClose,
    allTools,
    recentFiles,
    onFileSelect,
    onClearRecentFiles,
    getToolConfigFiles,
  ]);

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
    // Use data-index attribute to find the selected element in grouped view
    const selectedElement = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement
      || listRef.current?.children[selectedIndex] as HTMLElement;
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const placeholder = isQuickOpenMode
    ? 'Search files by name or path...'
    : 'Type a command or search...';

  // Group commands by category for section headers (only when not searching)
  const groupedCommands = useMemo(() => {
    if (query.trim() || isQuickOpenMode) {
      return null; // Don't group when filtering or in quick open mode
    }

    const groups: { category: string; label: string; commands: Command[] }[] = [];
    const categoryOrder = ['recent', 'navigation', 'tools', 'settings'];
    const categoryLabels: Record<string, string> = {
      recent: 'Recent',
      navigation: 'Navigation',
      tools: 'Tools',
      settings: 'Settings',
    };

    categoryOrder.forEach((cat) => {
      const catCommands = filteredCommands.filter((cmd) => cmd.category === cat);
      if (catCommands.length > 0) {
        groups.push({ category: cat, label: categoryLabels[cat], commands: catCommands });
      }
    });

    // Add any uncategorized commands
    const uncategorized = filteredCommands.filter((cmd) => !cmd.category || !categoryOrder.includes(cmd.category));
    if (uncategorized.length > 0) {
      groups.push({ category: 'other', label: 'Other', commands: uncategorized });
    }

    return groups;
  }, [filteredCommands, query, isQuickOpenMode]);

  // Calculate flat index for keyboard navigation with grouped display
  const getFlatIndex = useCallback((groupIndex: number, commandIndex: number): number => {
    if (!groupedCommands) return commandIndex;
    let flatIndex = 0;
    for (let i = 0; i < groupIndex; i++) {
      flatIndex += groupedCommands[i].commands.length;
    }
    return flatIndex + commandIndex;
  }, [groupedCommands]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="flex flex-col max-h-[70vh]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
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
              No {isQuickOpenMode ? 'files' : 'commands'} found for "{query}"
            </div>
          ) : groupedCommands ? (
            // Grouped display with section headers
            groupedCommands.map((group, groupIndex) => (
              <div key={group.category}>
                <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 sticky top-0 bg-white dark:bg-slate-900">
                  {group.label}
                </div>
                {group.commands.map((cmd, cmdIndex) => {
                  const flatIndex = getFlatIndex(groupIndex, cmdIndex);
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      data-index={flatIndex}
                      className={`w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset
                        ${
                          flatIndex === selectedIndex
                            ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                    >
                      <span
                        className={`flex-shrink-0 ${
                          flatIndex === selectedIndex
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : cmd.category === 'recent'
                              ? 'text-amber-500 dark:text-amber-400'
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
                  );
                })}
              </div>
            ))
          ) : (
            // Flat display (when searching or quick open mode)
            filteredCommands.map((cmd, index) => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                className={`w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset
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
                      : cmd.category === 'recent'
                        ? 'text-amber-500 dark:text-amber-400'
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
                {cmd.category === 'recent' && (
                  <span className="flex-shrink-0 text-[10px] font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-1.5 py-0.5 rounded">
                    Recent
                  </span>
                )}
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
            {!isQuickOpenMode && (
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                  {formatShortcut({ ctrl: true, key: 'P' })}
                </kbd>
                Quick Open
              </span>
            )}
          </div>
          <span>{filteredCommands.length} {isQuickOpenMode ? 'files' : 'commands'}</span>
        </div>
      </div>
    </Modal>
  );
}
