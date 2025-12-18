use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ConfigFormat {
    Json,
    Yaml,
    Toml,
    Ini,
    Md,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SuggestedConfig {
    pub label: String,
    pub path: String,
    pub format: ConfigFormat,
    pub icon: Option<String>,
    pub description: Option<String>,
    pub json_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CliTool {
    pub id: String,
    pub name: String,
    pub icon: Option<String>,
    pub docs_url: Option<String>,
    pub description: Option<String>,
    pub suggested_configs: Option<Vec<SuggestedConfig>>,
}

pub fn get_cli_tools() -> Vec<CliTool> {
    vec![
        CliTool {
            id: "claude-code".to_string(),
            name: "Claude Code".to_string(),
            icon: Some("🤖".to_string()),
            docs_url: Some("https://code.claude.com/docs/en/settings".to_string()),
            description: Some("Anthropic's official Claude Code CLI".to_string()),
            suggested_configs: Some(vec![
                SuggestedConfig {
                    label: "Settings".to_string(),
                    path: "~/.claude/settings.json".to_string(),
                    format: ConfigFormat::Json,
                    icon: Some("⚙️".to_string()),
                    description: Some("User settings (permissions, env, hooks, model)".to_string()),
                    json_path: None,
                },
                SuggestedConfig {
                    label: "MCP Servers (User)".to_string(),
                    path: "~/.claude.json".to_string(),
                    format: ConfigFormat::Json,
                    icon: Some("🔌".to_string()),
                    description: Some("User-level MCP server configuration".to_string()),
                    json_path: Some("mcpServers".to_string()),
                },
                SuggestedConfig {
                    label: "MCP Servers (Project)".to_string(),
                    path: ".mcp.json".to_string(),
                    format: ConfigFormat::Json,
                    icon: Some("📁".to_string()),
                    description: Some("Project-level MCP server configuration".to_string()),
                    json_path: None,
                },
                SuggestedConfig {
                    label: "Memory".to_string(),
                    path: "~/.claude/CLAUDE.md".to_string(),
                    format: ConfigFormat::Md,
                    icon: Some("📝".to_string()),
                    description: Some("Global instructions/memory file".to_string()),
                    json_path: None,
                },
            ]),
        },
        CliTool {
            id: "gemini-cli".to_string(),
            name: "Gemini CLI".to_string(),
            icon: Some("💎".to_string()),
            docs_url: Some("https://geminicli.com/docs/".to_string()),
            description: Some("Google's Gemini CLI".to_string()),
            suggested_configs: Some(vec![
                SuggestedConfig {
                    label: "Settings".to_string(),
                    path: "~/.gemini/settings.json".to_string(),
                    format: ConfigFormat::Json,
                    icon: Some("⚙️".to_string()),
                    description: Some("Main settings with MCP servers".to_string()),
                    json_path: None,
                },
                SuggestedConfig {
                    label: "Memory".to_string(),
                    path: "~/.gemini/GEMINI.md".to_string(),
                    format: ConfigFormat::Md,
                    icon: Some("📝".to_string()),
                    description: Some("Global context/memory file".to_string()),
                    json_path: None,
                },
            ]),
        },
        CliTool {
            id: "aider".to_string(),
            name: "Aider".to_string(),
            icon: Some("🔧".to_string()),
            docs_url: Some("https://aider.chat/docs/config.html".to_string()),
            description: Some("AI pair programming in your terminal".to_string()),
            suggested_configs: Some(vec![
                SuggestedConfig {
                    label: "Settings".to_string(),
                    path: "~/.aider.conf.yml".to_string(),
                    format: ConfigFormat::Yaml,
                    icon: Some("⚙️".to_string()),
                    description: Some("Main configuration file".to_string()),
                    json_path: None,
                },
            ]),
        },
        CliTool {
            id: "continue".to_string(),
            name: "Continue".to_string(),
            icon: Some("▶️".to_string()),
            docs_url: Some("https://docs.continue.dev/".to_string()),
            description: Some("Open-source AI code assistant".to_string()),
            suggested_configs: Some(vec![
                SuggestedConfig {
                    label: "Settings".to_string(),
                    path: "~/.continue/config.json".to_string(),
                    format: ConfigFormat::Json,
                    icon: Some("⚙️".to_string()),
                    description: Some("Main configuration file".to_string()),
                    json_path: None,
                },
            ]),
        },
        CliTool {
            id: "amp".to_string(),
            name: "Amp".to_string(),
            icon: Some("⚡".to_string()),
            docs_url: Some("https://ampcode.com/manual".to_string()),
            description: Some("Sourcegraph's AI coding agent".to_string()),
            suggested_configs: Some(vec![
                SuggestedConfig {
                    label: "Settings".to_string(),
                    path: "~/.config/amp/settings.toml".to_string(),
                    format: ConfigFormat::Toml,
                    icon: Some("⚙️".to_string()),
                    description: Some("Main configuration file".to_string()),
                    json_path: None,
                },
            ]),
        },
        CliTool {
            id: "gh-copilot".to_string(),
            name: "GitHub Copilot CLI".to_string(),
            icon: Some("🐙".to_string()),
            docs_url: Some("https://docs.github.com/en/copilot/github-copilot-in-the-cli".to_string()),
            description: Some("GitHub's AI-powered CLI assistant".to_string()),
            suggested_configs: Some(vec![
                SuggestedConfig {
                    label: "Settings".to_string(),
                    path: "~/.config/gh-copilot/config.yml".to_string(),
                    format: ConfigFormat::Yaml,
                    icon: Some("⚙️".to_string()),
                    description: Some("Main configuration file".to_string()),
                    json_path: None,
                },
            ]),
        },
        CliTool {
            id: "cursor".to_string(),
            name: "Cursor".to_string(),
            icon: Some("📝".to_string()),
            docs_url: Some("https://cursor.sh/docs".to_string()),
            description: Some("AI-first code editor".to_string()),
            suggested_configs: Some(vec![
                SuggestedConfig {
                    label: "Settings".to_string(),
                    path: "~/.config/Cursor/User/settings.json".to_string(),
                    format: ConfigFormat::Json,
                    icon: Some("⚙️".to_string()),
                    description: Some("User settings file".to_string()),
                    json_path: None,
                },
            ]),
        },
        CliTool {
            id: "cody".to_string(),
            name: "Cody CLI".to_string(),
            icon: Some("🧠".to_string()),
            docs_url: Some("https://sourcegraph.com/docs/cody".to_string()),
            description: Some("Sourcegraph's AI coding assistant".to_string()),
            suggested_configs: Some(vec![
                SuggestedConfig {
                    label: "Settings".to_string(),
                    path: "~/.cody/config.json".to_string(),
                    format: ConfigFormat::Json,
                    icon: Some("⚙️".to_string()),
                    description: Some("Main configuration file".to_string()),
                    json_path: None,
                },
            ]),
        },
    ]
}
