/* eslint-disable react-refresh/only-export-components */
import {
  Bot,
  Zap,
  Github,
  Box,
  Sparkles,
  Folder,
  Monitor,
  Puzzle,
} from 'lucide-react';

export const TOOL_ICONS: Record<string, React.ReactNode> = {
  'claude-code': <Bot className="w-4 h-4" />,
  'gemini-cli': <Sparkles className="w-4 h-4" />,
  'amp': <Zap className="w-4 h-4" />,
  'gh-copilot': <Github className="w-4 h-4" />,
  'cursor': <Box className="w-4 h-4" />,
  'opencode': <span className="w-4 h-4 flex items-center justify-center text-sm">⌬</span>,
  'droid': <Bot className="w-4 h-4" />,
  'qwen-code': <span className="w-4 h-4 flex items-center justify-center">🐦</span>,
  'auggie': <Bot className="w-4 h-4" />,
  'kiro-cli': <span className="w-4 h-4 flex items-center justify-center">🪁</span>,
  'rovo-dev': <span className="w-4 h-4 flex items-center justify-center">🔷</span>,
};

export const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  'vscode': <Monitor className="w-4 h-4 text-blue-500" />,
  'cursor': <Box className="w-4 h-4 text-purple-500" />,
  'windsurf': <span className="w-4 h-4 flex items-center justify-center">🏄</span>,
  'antigravity': <span className="w-4 h-4 flex items-center justify-center">🚀</span>,
};

export const DEFAULT_TOOL_ICON = <Folder className="w-4 h-4" />;
export const DEFAULT_PLATFORM_ICON = <Monitor className="w-4 h-4" />;
export const EXTENSION_ICON = <Puzzle className="w-3.5 h-3.5 text-amber-500" />;

export type AccentColor = 'indigo' | 'violet' | 'emerald' | 'amber' | 'blue';

export const ACCENT_COLORS: Record<AccentColor, {
  badge: string;
  badgeText: string;
  hover: string;
  ring: string;
  activeBg: string;
  activeText: string;
  border: string;
}> = {
  indigo: {
    badge: 'bg-indigo-100 dark:bg-indigo-500/10',
    badgeText: 'text-indigo-600 dark:text-indigo-400',
    hover: 'hover:text-indigo-600 dark:hover:text-indigo-400',
    ring: 'focus-visible:ring-indigo-500/40',
    activeBg: 'bg-indigo-50 dark:bg-indigo-500/10',
    activeText: 'text-indigo-700 dark:text-indigo-200',
    border: 'border-indigo-500',
  },
  violet: {
    badge: 'bg-violet-100 dark:bg-violet-500/10',
    badgeText: 'text-violet-600 dark:text-violet-400',
    hover: 'hover:text-violet-600 dark:hover:text-violet-400',
    ring: 'focus-visible:ring-violet-500/40',
    activeBg: 'bg-violet-50 dark:bg-violet-500/10',
    activeText: 'text-violet-700 dark:text-violet-200',
    border: 'border-violet-500',
  },
  emerald: {
    badge: 'bg-emerald-100 dark:bg-emerald-500/10',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    hover: 'hover:text-emerald-600 dark:hover:text-emerald-400',
    ring: 'focus-visible:ring-emerald-500/40',
    activeBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    activeText: 'text-emerald-700 dark:text-emerald-200',
    border: 'border-emerald-500',
  },
  amber: {
    badge: 'bg-amber-100 dark:bg-amber-500/10',
    badgeText: 'text-amber-600 dark:text-amber-400',
    hover: 'hover:text-amber-600 dark:hover:text-amber-400',
    ring: 'focus-visible:ring-amber-500/40',
    activeBg: 'bg-amber-50 dark:bg-amber-500/10',
    activeText: 'text-amber-700 dark:text-amber-200',
    border: 'border-amber-500',
  },
  blue: {
    badge: 'bg-blue-100 dark:bg-blue-500/10',
    badgeText: 'text-blue-600 dark:text-blue-400',
    hover: 'hover:text-blue-600 dark:hover:text-blue-400',
    ring: 'focus-visible:ring-blue-500/40',
    activeBg: 'bg-blue-50 dark:bg-blue-500/10',
    activeText: 'text-blue-700 dark:text-blue-200',
    border: 'border-blue-500',
  },
};
