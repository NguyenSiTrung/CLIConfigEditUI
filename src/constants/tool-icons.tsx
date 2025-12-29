/* eslint-disable react-refresh/only-export-components */
import {
  Folder,
  Monitor,
  Puzzle,
} from 'lucide-react';
import {

  GeminiIcon,
  AmpIcon,

  CursorIcon,

  AuggieIcon,
  RovoDevIcon,
  KiloCodeIcon,


  QoderIcon,
  VSCodeIcon,
  WindsurfIcon,
  AntigravityIcon,
} from './brand-icons';

export const TOOL_ICONS: Record<string, React.ReactNode> = {
  'claude-code': (
    <img
      src="/claude-code.png"
      alt="Claude Code"
      className="w-4 h-4 object-contain"
      loading="lazy"
    />
  ),
  'gemini-cli': <GeminiIcon />,
  'amp': <AmpIcon />,
  'gh-copilot': (
    <img
      src="/github-copilot.png"
      alt="GitHub Copilot"
      className="w-4 h-4 object-contain"
      loading="lazy"
    />
  ),
  'cursor': <CursorIcon />,
  'opencode': (
    <img
      src="/opencode.png"
      alt="OpenCode"
      className="w-4 h-4 object-contain"
      loading="lazy"
    />
  ),
  'droid': (
    <img
      src="/factory-droid.png"
      alt="Factory Droid"
      className="w-4 h-4 object-contain"
      loading="lazy"
    />
  ),
  'qwen-code': (
    <img
      src="/qwen-code.png"
      alt="Qwen Code"
      className="w-4 h-4 object-contain"
      loading="lazy"
    />
  ),
  'auggie': <AuggieIcon />,
  'kiro-cli': (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#8B5CF6" />
      <path d="M12 4C8.5 4 6 6.5 6 10V15C6 15.5 6.2 16 6.5 16.3C6.5 16.3 7 17 7.5 17C7.8 17 8 16.8 8 16.5V15C8 14.7 8.3 14.5 8.5 14.7L9.5 16C9.8 16.3 10 16.5 10.5 16.5C10.8 16.5 11 16.3 11 16V14.5C11 14.2 11.3 14 11.5 14.2L12 15C12.2 15.3 12.5 15.5 13 15.5C13.5 15.5 13.8 15.3 14 15L14.5 14.2C14.7 14 15 14.2 15 14.5V16C15 16.3 15.2 16.5 15.5 16.5C16 16.5 16.2 16.3 16.5 16L17.5 14.7C17.7 14.5 18 14.7 18 15V16.5C18 16.8 18.2 17 18.5 17C19 17 19.5 16.3 19.5 16.3C19.8 16 20 15.5 20 15V10C20 6.5 17.5 4 14 4H12Z" fill="white" />
      <ellipse cx="10" cy="10" rx="1.2" ry="1.5" fill="#1F1F1F" />
      <ellipse cx="14.5" cy="10" rx="1.2" ry="1.5" fill="#1F1F1F" />
    </svg>
  ),
  'rovo-dev': <RovoDevIcon />,
  'kilo-code-cli': <KiloCodeIcon />,
  'letta-code': (
    <img
      src="/letta-code.png"
      alt="Letta Code"
      className="w-4 h-4 object-contain"
      loading="lazy"
    />
  ),
  'qoder': <QoderIcon />,
};

export const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  'vscode': <VSCodeIcon />,
  'cursor': <CursorIcon />,
  'windsurf': <WindsurfIcon />,
  'antigravity': <AntigravityIcon />,
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
