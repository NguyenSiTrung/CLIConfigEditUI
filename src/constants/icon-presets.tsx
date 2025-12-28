/* eslint-disable react-refresh/only-export-components */
import {
  Terminal,
  Code,
  Cpu,
  Server,
  Database,
  Cloud,
  Settings,
  Wrench,
  Hammer,
  Cog,
  Box,
  Package,
  Folder,
  File,
  FileCode,
  FileCog,
  FileJson,
  FileText,
  GitBranch,
  GitCommit,
  Github,
  Globe,
  Laptop,
  Monitor,
  Smartphone,
  Layers,
  Layout,
  Blocks,
  Puzzle,
  Zap,
  Flame,
  Sparkles,
  Star,
  Heart,
  Shield,
  Lock,
  Key,
  Eye,
  Search,
  type LucideIcon,
} from 'lucide-react';

export interface AIPresetIcon {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export const AI_PRESET_ICONS: AIPresetIcon[] = [
  { id: 'aider', name: 'Aider', emoji: '🤖', color: '#10B981' },
  { id: 'continue', name: 'Continue', emoji: '▶️', color: '#6366F1' },
  { id: 'cody', name: 'Cody', emoji: '🔵', color: '#FF6B6B' },
  { id: 'tabnine', name: 'Tabnine', emoji: '⚡', color: '#CA3CFF' },
  { id: 'codeium', name: 'Codeium', emoji: '🌊', color: '#09B6A2' },
  { id: 'amazon-q', name: 'Amazon Q', emoji: '📦', color: '#FF9900' },
  { id: 'sourcery', name: 'Sourcery', emoji: '🔮', color: '#7C3AED' },
  { id: 'sweep', name: 'Sweep', emoji: '🧹', color: '#F59E0B' },
  { id: 'mentat', name: 'Mentat', emoji: '🧠', color: '#EC4899' },
  { id: 'codegpt', name: 'CodeGPT', emoji: '💬', color: '#10A37F' },
  { id: 'blackbox', name: 'Blackbox', emoji: '⬛', color: '#000000' },
  { id: 'replit', name: 'Replit AI', emoji: '🔁', color: '#F26207' },
];

export interface LucideIconOption {
  name: string;
  icon: LucideIcon;
  category: 'terminal' | 'code' | 'server' | 'files' | 'git' | 'misc';
}

export const LUCIDE_ICON_OPTIONS: LucideIconOption[] = [
  { name: 'Terminal', icon: Terminal, category: 'terminal' },
  { name: 'Code', icon: Code, category: 'code' },
  { name: 'Cpu', icon: Cpu, category: 'server' },
  { name: 'Server', icon: Server, category: 'server' },
  { name: 'Database', icon: Database, category: 'server' },
  { name: 'Cloud', icon: Cloud, category: 'server' },
  { name: 'Settings', icon: Settings, category: 'misc' },
  { name: 'Wrench', icon: Wrench, category: 'misc' },
  { name: 'Hammer', icon: Hammer, category: 'misc' },
  { name: 'Cog', icon: Cog, category: 'misc' },
  { name: 'Box', icon: Box, category: 'misc' },
  { name: 'Package', icon: Package, category: 'misc' },
  { name: 'Folder', icon: Folder, category: 'files' },
  { name: 'File', icon: File, category: 'files' },
  { name: 'FileCode', icon: FileCode, category: 'files' },
  { name: 'FileCog', icon: FileCog, category: 'files' },
  { name: 'FileJson', icon: FileJson, category: 'files' },
  { name: 'FileText', icon: FileText, category: 'files' },
  { name: 'GitBranch', icon: GitBranch, category: 'git' },
  { name: 'GitCommit', icon: GitCommit, category: 'git' },
  { name: 'Github', icon: Github, category: 'git' },
  { name: 'Globe', icon: Globe, category: 'misc' },
  { name: 'Laptop', icon: Laptop, category: 'misc' },
  { name: 'Monitor', icon: Monitor, category: 'misc' },
  { name: 'Smartphone', icon: Smartphone, category: 'misc' },
  { name: 'Layers', icon: Layers, category: 'misc' },
  { name: 'Layout', icon: Layout, category: 'misc' },
  { name: 'Blocks', icon: Blocks, category: 'code' },
  { name: 'Puzzle', icon: Puzzle, category: 'code' },
  { name: 'Zap', icon: Zap, category: 'misc' },
  { name: 'Flame', icon: Flame, category: 'misc' },
  { name: 'Sparkles', icon: Sparkles, category: 'misc' },
  { name: 'Star', icon: Star, category: 'misc' },
  { name: 'Heart', icon: Heart, category: 'misc' },
  { name: 'Shield', icon: Shield, category: 'misc' },
  { name: 'Lock', icon: Lock, category: 'misc' },
  { name: 'Key', icon: Key, category: 'misc' },
  { name: 'Eye', icon: Eye, category: 'misc' },
  { name: 'Search', icon: Search, category: 'misc' },
];

export interface EmojiCategory {
  name: string;
  emojis: string[];
}

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    name: 'Tools',
    emojis: ['🔧', '⚙️', '🛠️', '🔩', '⚒️', '🪛', '🪚', '🔨', '🔑', '🗝️'],
  },
  {
    name: 'Tech',
    emojis: ['💻', '🖥️', '⌨️', '🖱️', '📱', '📲', '🔌', '💾', '💿', '📀', '🧮', '🤖'],
  },
  {
    name: 'Objects',
    emojis: ['📦', '📁', '📂', '📝', '📄', '📜', '📋', '🗂️', '🗃️', '🗄️', '📚', '📖'],
  },
  {
    name: 'Symbols',
    emojis: ['⚡', '🔥', '✨', '💫', '🌟', '⭐', '🎯', '🚀', '💡', '🔮', '🌐', '🔗'],
  },
  {
    name: 'Actions',
    emojis: ['▶️', '⏸️', '⏹️', '🔄', '🔁', '↩️', '↪️', '⬆️', '⬇️', '➡️', '⬅️', '🔀'],
  },
  {
    name: 'Status',
    emojis: ['✅', '❌', '⚠️', '🔒', '🔓', '👁️', '🔔', '🔕', '💬', '💭', '❓', '❗'],
  },
];

export const ALL_EMOJIS = EMOJI_CATEGORIES.flatMap(c => c.emojis);
