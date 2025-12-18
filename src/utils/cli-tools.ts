import { CliTool } from '@/types';

export const CLI_TOOLS: CliTool[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    icon: '🤖',
    docsUrl: 'https://code.claude.com/docs/en/settings',
    description: "Anthropic's official Claude Code CLI",
    suggestedConfigs: [
      {
        label: 'Settings',
        path: '~/.claude/settings.json',
        format: 'json',
        icon: '⚙️',
        description: 'User settings (permissions, env, hooks, model)',
      },
      {
        label: 'MCP Servers (User)',
        path: '~/.claude.json',
        format: 'json',
        icon: '🔌',
        description: 'User-level MCP server configuration',
        jsonPath: 'mcpServers',
      },
      {
        label: 'MCP Servers (Project)',
        path: '.mcp.json',
        format: 'json',
        icon: '📁',
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
    icon: '✨',
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
    icon: '▢',
    docsUrl: 'https://cursor.com/docs',
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
    id: 'opencode',
    name: 'OpenCode',
    icon: '⌬',
    docsUrl: 'https://opencode.ai/docs/config/',
    description: 'AI coding agent for the terminal by SST',
    suggestedConfigs: [
      {
        label: 'Global Config',
        path: '~/.config/opencode/opencode.json',
        format: 'json',
        icon: '⚙️',
        description: 'Global configuration file',
      },
      {
        label: 'Project Config',
        path: 'opencode.json',
        format: 'json',
        icon: '📁',
        description: 'Project-level configuration',
      },
    ],
  },
];
