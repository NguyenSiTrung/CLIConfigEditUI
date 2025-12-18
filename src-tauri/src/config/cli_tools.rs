use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlatformPaths {
    pub macos: Vec<String>,
    pub linux: Vec<String>,
    pub windows: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ConfigFormat {
    Json,
    Yaml,
    Toml,
    Ini,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CliTool {
    pub id: String,
    pub name: String,
    pub icon: Option<String>,
    pub config_paths: PlatformPaths,
    pub config_format: ConfigFormat,
    pub docs_url: Option<String>,
    pub description: Option<String>,
}

pub fn get_cli_tools() -> Vec<CliTool> {
    vec![
        CliTool {
            id: "claude-cli".to_string(),
            name: "Claude CLI".to_string(),
            icon: Some("🤖".to_string()),
            config_paths: PlatformPaths {
                macos: vec!["~/.claude/settings.json".to_string()],
                linux: vec!["~/.claude/settings.json".to_string()],
                windows: vec!["%USERPROFILE%\\.claude\\settings.json".to_string()],
            },
            config_format: ConfigFormat::Json,
            docs_url: Some("https://docs.anthropic.com/claude-cli".to_string()),
            description: Some("Anthropic's official Claude CLI".to_string()),
        },
        CliTool {
            id: "aider".to_string(),
            name: "Aider".to_string(),
            icon: Some("🔧".to_string()),
            config_paths: PlatformPaths {
                macos: vec!["~/.aider.conf.yml".to_string()],
                linux: vec!["~/.aider.conf.yml".to_string()],
                windows: vec!["%USERPROFILE%\\.aider.conf.yml".to_string()],
            },
            config_format: ConfigFormat::Yaml,
            docs_url: Some("https://aider.chat/docs/config.html".to_string()),
            description: Some("AI pair programming in your terminal".to_string()),
        },
        CliTool {
            id: "continue".to_string(),
            name: "Continue".to_string(),
            icon: Some("▶️".to_string()),
            config_paths: PlatformPaths {
                macos: vec!["~/.continue/config.json".to_string()],
                linux: vec!["~/.continue/config.json".to_string()],
                windows: vec!["%USERPROFILE%\\.continue\\config.json".to_string()],
            },
            config_format: ConfigFormat::Json,
            docs_url: Some("https://docs.continue.dev/".to_string()),
            description: Some("Open-source AI code assistant".to_string()),
        },
        CliTool {
            id: "amp".to_string(),
            name: "Amp".to_string(),
            icon: Some("⚡".to_string()),
            config_paths: PlatformPaths {
                macos: vec!["~/.config/amp/settings.toml".to_string()],
                linux: vec!["~/.config/amp/settings.toml".to_string()],
                windows: vec!["%APPDATA%\\amp\\settings.toml".to_string()],
            },
            config_format: ConfigFormat::Toml,
            docs_url: Some("https://ampcode.com/manual".to_string()),
            description: Some("Anthropic's AI coding agent".to_string()),
        },
        CliTool {
            id: "gh-copilot".to_string(),
            name: "GitHub Copilot CLI".to_string(),
            icon: Some("🐙".to_string()),
            config_paths: PlatformPaths {
                macos: vec!["~/.config/gh-copilot/config.yml".to_string()],
                linux: vec!["~/.config/gh-copilot/config.yml".to_string()],
                windows: vec!["%APPDATA%\\gh-copilot\\config.yml".to_string()],
            },
            config_format: ConfigFormat::Yaml,
            docs_url: Some("https://docs.github.com/en/copilot/github-copilot-in-the-cli".to_string()),
            description: Some("GitHub's AI-powered CLI assistant".to_string()),
        },
        CliTool {
            id: "cursor".to_string(),
            name: "Cursor".to_string(),
            icon: Some("📝".to_string()),
            config_paths: PlatformPaths {
                macos: vec!["~/Library/Application Support/Cursor/User/settings.json".to_string()],
                linux: vec!["~/.config/Cursor/User/settings.json".to_string()],
                windows: vec!["%APPDATA%\\Cursor\\User\\settings.json".to_string()],
            },
            config_format: ConfigFormat::Json,
            docs_url: Some("https://cursor.sh/docs".to_string()),
            description: Some("AI-first code editor".to_string()),
        },
        CliTool {
            id: "cody".to_string(),
            name: "Cody CLI".to_string(),
            icon: Some("🧠".to_string()),
            config_paths: PlatformPaths {
                macos: vec!["~/.cody/config.json".to_string()],
                linux: vec!["~/.cody/config.json".to_string()],
                windows: vec!["%USERPROFILE%\\.cody\\config.json".to_string()],
            },
            config_format: ConfigFormat::Json,
            docs_url: Some("https://sourcegraph.com/docs/cody".to_string()),
            description: Some("Sourcegraph's AI coding assistant".to_string()),
        },
    ]
}
