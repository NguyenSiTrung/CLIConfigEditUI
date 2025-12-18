import { CliTool } from '@/types';

export const CLI_TOOLS: CliTool[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    icon: '🤖',
    docsUrl: 'https://docs.anthropic.com/claude-code',
    description: "Anthropic's official Claude Code CLI",
    suggestedConfigs: [
      {
        label: 'Settings',
        path: '~/.claude/settings.json',
        format: 'json',
        icon: '⚙️',
        description: 'Main settings file',
      },
      {
        label: 'MCP Servers',
        path: '.mcp.json',
        format: 'json',
        icon: '🔌',
        description: 'Project-level MCP server configuration',
      },
      {
        label: 'Memory',
        path: '~/.claude/CLAUDE.md',
        format: 'md',
        icon: '📝',
        description: 'Global instructions/memory file',
      },
    ],
  },
  {
    id: 'gemini-cli',
    name: 'Gemini CLI',
    icon: '💎',
    docsUrl: 'https://geminicli.com/docs/',
    description: "Google's Gemini CLI",
    suggestedConfigs: [
      {
        label: 'Settings',
        path: '~/.gemini/settings.json',
        format: 'json',
        icon: '⚙️',
        description: 'Main settings with MCP servers',
      },
      {
        label: 'Memory',
        path: '~/.gemini/GEMINI.md',
        format: 'md',
        icon: '📝',
        description: 'Global context/memory file',
      },
    ],
  },
  {
    id: 'aider',
    name: 'Aider',
    icon: '🔧',
    docsUrl: 'https://aider.chat/docs/config.html',
    description: 'AI pair programming in your terminal',
    suggestedConfigs: [
      {
        label: 'Settings',
        path: '~/.aider.conf.yml',
        format: 'yaml',
        icon: '⚙️',
        description: 'Main configuration file',
      },
    ],
  },
  {
    id: 'continue',
    name: 'Continue',
    icon: '▶️',
    docsUrl: 'https://docs.continue.dev/',
    description: 'Open-source AI code assistant',
    suggestedConfigs: [
      {
        label: 'Settings',
        path: '~/.continue/config.json',
        format: 'json',
        icon: '⚙️',
        description: 'Main configuration file',
      },
    ],
  },
  {
    id: 'amp',
    name: 'Amp',
    icon: '⚡',
    docsUrl: 'https://ampcode.com/manual',
    description: "Sourcegraph's AI coding agent",
    suggestedConfigs: [
      {
        label: 'Settings',
        path: '~/.config/amp/settings.toml',
        format: 'toml',
        icon: '⚙️',
        description: 'Main configuration file',
      },
    ],
  },
  {
    id: 'gh-copilot',
    name: 'GitHub Copilot CLI',
    icon: '🐙',
    docsUrl: 'https://docs.github.com/en/copilot/github-copilot-in-the-cli',
    description: "GitHub's AI-powered CLI assistant",
    suggestedConfigs: [
      {
        label: 'Settings',
        path: '~/.config/gh-copilot/config.yml',
        format: 'yaml',
        icon: '⚙️',
        description: 'Main configuration file',
      },
    ],
  },
  {
    id: 'cursor',
    name: 'Cursor',
    icon: '📝',
    docsUrl: 'https://cursor.sh/docs',
    description: 'AI-first code editor',
    suggestedConfigs: [
      {
        label: 'Settings',
        path: '~/.config/Cursor/User/settings.json',
        format: 'json',
        icon: '⚙️',
        description: 'User settings file',
      },
    ],
  },
  {
    id: 'cody',
    name: 'Cody CLI',
    icon: '🧠',
    docsUrl: 'https://sourcegraph.com/docs/cody',
    description: "Sourcegraph's AI coding assistant",
    suggestedConfigs: [
      {
        label: 'Settings',
        path: '~/.cody/config.json',
        format: 'json',
        icon: '⚙️',
        description: 'Main configuration file',
      },
    ],
  },
];
